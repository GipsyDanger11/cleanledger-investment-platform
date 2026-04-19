// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CleanLedger {
    struct Milestone {
        string title;
        string description;
        uint256 tranchePct;
        string status; // pending, in_progress, submitted, verified, released, missed, complete
        string proofUrl;
        uint256 voteDeadline;
        uint256 trustPenalty;
        bool redFlagged;
    }

    struct FundAllocation {
        uint256 techPlanned;
        uint256 marketingPlanned;
        uint256 operationsPlanned;
        uint256 legalPlanned;
        uint256 techActual;
        uint256 marketingActual;
        uint256 operationsActual;
        uint256 legalActual;
    }

    struct Startup {
        string id; // MongoDB ID or unique slug
        address founder;
        string name;
        string sector;
        string geography;
        string description;
        uint256 fundingTarget;
        uint256 totalRaised;
        uint256 backers;
        uint256 trustScore;
        string riskLevel;
        string verificationStatus;
        FundAllocation allocation;
        bool exists;
    }

    struct Investment {
        string id;
        address investor;
        string startupId;
        uint256 amount;
        uint256 timestamp;
        string trancheTag;
        string trancheStatus;
        string encryptedAmount; // FHE Ciphertext
    }

    mapping(string => Startup) public startups;
    mapping(string => Milestone[]) public startupMilestones;
    mapping(string => Investment[]) public startupInvestments;
    string[] public startupIds;

    event StartupCreated(string id, string name, address founder);
    event InvestmentPlaced(string id, string startupId, address investor, uint256 amount);
    event MilestoneUpdated(string startupId, uint256 index, string status);
    event TrustScoreUpdated(string startupId, uint256 newScore);

    function createStartup(
        string memory _id,
        string memory _name,
        string memory _sector,
        string memory _geography,
        string memory _description,
        uint256 _fundingTarget,
        uint256 _techPlanned,
        uint256 _marketingPlanned,
        uint256 _operationsPlanned,
        uint256 _legalPlanned
    ) public {
        require(!startups[_id].exists, "Startup already exists");

        startups[_id] = Startup({
            id: _id,
            founder: msg.sender,
            name: _name,
            sector: _sector,
            geography: _geography,
            description: _description,
            fundingTarget: _fundingTarget,
            totalRaised: 0,
            backers: 0,
            trustScore: 50,
            riskLevel: "MEDIUM",
            verificationStatus: "unverified",
            allocation: FundAllocation({
                techPlanned: _techPlanned,
                marketingPlanned: _marketingPlanned,
                operationsPlanned: _operationsPlanned,
                legalPlanned: _legalPlanned,
                techActual: 0,
                marketingActual: 0,
                operationsActual: 0,
                legalActual: 0
            }),
            exists: true
        });

        startupIds.push(_id);
        emit StartupCreated(_id, _name, msg.sender);
    }

    function addMilestone(
        string memory _startupId,
        string memory _title,
        string memory _description,
        uint256 _tranchePct
    ) public {
        require(startups[_startupId].exists, "Startup not found");
        require(msg.sender == startups[_startupId].founder, "Only founder can add milestones");

        startupMilestones[_startupId].push(Milestone({
            title: _title,
            description: _description,
            tranchePct: _tranchePct,
            status: "pending",
            proofUrl: "",
            voteDeadline: 0,
            trustPenalty: 0,
            redFlagged: false
        }));
    }

    function invest(
        string memory _investmentId,
        string memory _startupId,
        uint256 _amount,
        string memory _trancheTag,
        string memory _encryptedAmount
    ) public payable {
        require(startups[_startupId].exists, "Startup not found");
        
        startups[_startupId].totalRaised += _amount;
        startups[_startupId].backers += 1;

        startupInvestments[_startupId].push(Investment({
            id: _investmentId,
            investor: msg.sender,
            startupId: _startupId,
            amount: _amount,
            timestamp: block.timestamp,
            trancheTag: _trancheTag,
            trancheStatus: "Phase 1 - In Progress",
            encryptedAmount: _encryptedAmount
        }));

        emit InvestmentPlaced(_investmentId, _startupId, msg.sender, _amount);
    }

    function updateTrustScore(string memory _startupId, uint256 _newScore, string memory _riskLevel) public {
        // In a real app, this would be restricted to an oracle or admin
        require(startups[_startupId].exists, "Startup not found");
        startups[_startupId].trustScore = _newScore;
        startups[_startupId].riskLevel = _riskLevel;
        emit TrustScoreUpdated(_startupId, _newScore);
    }

    function getStartup(string memory _id) public view returns (Startup memory) {
        return startups[_id];
    }

    function getMilestones(string memory _startupId) public view returns (Milestone[] memory) {
        return startupMilestones[_startupId];
    }

    function getInvestments(string memory _startupId) public view returns (Investment[] memory) {
        return startupInvestments[_startupId];
    }
}

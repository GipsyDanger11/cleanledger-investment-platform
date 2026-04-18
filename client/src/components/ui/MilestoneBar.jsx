import './MilestoneBar.css';

const STATUS_CONFIG = {
  complete:    { icon: 'check_circle', label: 'Complete',    className: 'milestone--complete'  },
  in_progress: { icon: 'autorenew',    label: 'In Progress', className: 'milestone--progress'  },
  pending:     { icon: 'schedule',     label: 'Pending',     className: 'milestone--pending'   },
};

export default function MilestoneBar({ milestones }) {
  return (
    <div className="milestone-bar">
      {milestones.map((ms, idx) => {
        const cfg = STATUS_CONFIG[ms.status] || STATUS_CONFIG.pending;
        return (
          <div key={ms.phase} className={`milestone-phase ${cfg.className}`}>
            {/* Connector line */}
            {idx > 0 && (
              <div className={`milestone-phase__connector ${milestones[idx - 1].status === 'complete' ? 'milestone-phase__connector--done' : ''}`} />
            )}

            {/* Icon */}
            <div className="milestone-phase__icon-wrap">
              <span className="material-symbols-outlined milestone-phase__icon">
                {cfg.icon}
              </span>
            </div>

            {/* Content */}
            <div className="milestone-phase__content">
              <div className="milestone-phase__header">
                <span className="text-label-md" style={{ color: 'var(--color-on-surface)' }}>
                  Phase {ms.phase} — {ms.title}
                </span>
                <span className={`chip milestone-phase__status-chip`}>
                  {cfg.label}
                </span>
                {ms.daoVoteRequired && (
                  <span className="chip chip--filter" style={{ fontSize: '0.6rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>how_to_vote</span>
                    DAO Vote
                  </span>
                )}
              </div>
              {ms.notes && (
                <p className="text-body-sm text-secondary milestone-phase__notes">{ms.notes}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import React from 'react';
import type { VisitRecord } from '../types';

interface VisitListProps {
  visits: VisitRecord[];
  onDelete: (visit: VisitRecord) => void;
}

const VisitList: React.FC<VisitListProps> = ({ visits, onDelete }) => {
  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (visits.length === 0) {
    return (
      <div className="empty-state small">
        <p>暂无拜访记录</p>
        <p className="empty-hint">点击"添加拜访记录"按钮</p>
      </div>
    );
  }

  return (
    <div className="visit-list">
      <h4>拜访记录 ({visits.length})</h4>
      {visits.map((visit, index) => (
        <div key={visit.id} className="visit-item">
          <div className="visit-header">
            <span className="visit-number">#{visits.length - index}</span>
            <span className="visit-time">{formatDateTime(visit.visitTime)}</span>
            <button
              className="delete-btn"
              onClick={() => onDelete(visit)}
            >
              删除
            </button>
          </div>
          <p className="visit-event">{visit.event}</p>
        </div>
      ))}
    </div>
  );
};

export default VisitList;

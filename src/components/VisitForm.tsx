import React, { useState } from 'react';
import type { VisitFormData } from '../types';

interface VisitFormProps {
  onSubmit: (data: VisitFormData) => void;
  onCancel: () => void;
}

const VisitForm: React.FC<VisitFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<VisitFormData>({
    visitTime: new Date().toISOString().slice(0, 16), // 格式: YYYY-MM-DDTHH:mm
    event: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.event.trim()) {
      alert('请输入拜访事件');
      return;
    }
    onSubmit(formData);
  };

  // 设置当前时间
  const setCurrentTime = () => {
    setFormData(prev => ({
      ...prev,
      visitTime: new Date().toISOString().slice(0, 16),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="visit-form">
      <div className="form-group">
        <label htmlFor="visitTime">拜访时间 *</label>
        <div className="datetime-input-group">
          <input
            type="datetime-local"
            id="visitTime"
            name="visitTime"
            value={formData.visitTime}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="now-btn"
            onClick={setCurrentTime}
          >
            现在
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="event">拜访事件 *</label>
        <textarea
          id="event"
          name="event"
          value={formData.event}
          onChange={handleChange}
          placeholder="请输入拜访事件详情..."
          rows={4}
          required
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          取消
        </button>
        <button type="submit" className="btn-submit">
          保存记录
        </button>
      </div>
    </form>
  );
};

export default VisitForm;

import { useState, useEffect } from 'react';
import type { Clinic, VisitRecord } from './types';
import {
  getClinics,
  saveClinic,
  updateClinic,
  deleteClinic,
  getVisitsByClinicId,
  saveVisit,
  deleteVisit,
} from './services/storage';
import ClinicList from './components/ClinicList';
import ClinicForm from './components/ClinicForm';
import VisitList from './components/VisitList';
import VisitForm from './components/VisitForm';
import './App.css';

type View = 'list' | 'add' | 'edit' | 'detail';

function App() {
  const [view, setView] = useState<View>('list');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 加载诊所列表
  const loadClinics = async () => {
    const data = await getClinics();
    setClinics(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadClinics();
  }, []);

  // 加载拜访记录
  const loadVisits = async (clinicId: string) => {
    const data = await getVisitsByClinicId(clinicId);
    setVisits(data);
  };

  // 添加诊所
  const handleAddClinic = async (formData: {
    name: string;
    address: string;
    doctorName: string;
    phone: string;
  }) => {
    await saveClinic(formData);
    await loadClinics();
    setView('list');
  };

  // 更新诊所
  const handleUpdateClinic = async (formData: {
    name: string;
    address: string;
    doctorName: string;
    phone: string;
  }) => {
    if (selectedClinic) {
      await updateClinic(selectedClinic.id, formData);
      await loadClinics();
      setView('list');
      setSelectedClinic(null);
    }
  };

  // 删除诊所
  const handleDeleteClinic = async (clinic: Clinic) => {
    if (confirm(`确定要删除诊所"${clinic.name}"吗？\n此操作将同时删除所有相关拜访记录。`)) {
      await deleteClinic(clinic.id);
      await loadClinics();
      if (selectedClinic?.id === clinic.id) {
        setSelectedClinic(null);
        setView('list');
      }
    }
  };

  // 选择诊所查看详情
  const handleSelectClinic = async (clinic: Clinic) => {
    setSelectedClinic(clinic);
    await loadVisits(clinic.id);
    setView('detail');
  };

  // 编辑诊所
  const handleEditClinic = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setView('edit');
  };

  // 添加拜访记录
  const handleAddVisit = async (formData: { visitTime: string; event: string }) => {
    if (selectedClinic) {
      await saveVisit({
        clinicId: selectedClinic.id,
        visitTime: formData.visitTime,
        event: formData.event,
      });
      await loadVisits(selectedClinic.id);
      setShowVisitForm(false);
    }
  };

  // 删除拜访记录
  const handleDeleteVisit = async (visit: VisitRecord) => {
    if (confirm('确定要删除这条拜访记录吗？')) {
      await deleteVisit(visit.id);
      if (selectedClinic) {
        await loadVisits(selectedClinic.id);
      }
    }
  };

  // 渲染头部
  const renderHeader = () => {
    let title = '诊所管理';
    if (view === 'add') title = '添加诊所';
    if (view === 'edit') title = '编辑诊所';
    if (view === 'detail') title = selectedClinic?.name || '诊所详情';

    return (
      <header className="app-header">
        {view !== 'list' && (
          <button className="back-btn" onClick={() => setView('list')}>
            ← 返回
          </button>
        )}
        <h1>{title}</h1>
        {view === 'list' && (
          <button className="add-btn" onClick={() => setView('add')}>
            + 添加
          </button>
        )}
      </header>
    );
  };

  // 渲染内容
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      );
    }

    switch (view) {
      case 'add':
        return (
          <div className="form-container">
            <ClinicForm
              onSubmit={handleAddClinic}
              onCancel={() => setView('list')}
              submitText="添加诊所"
            />
          </div>
        );

      case 'edit':
        return selectedClinic ? (
          <div className="form-container">
            <ClinicForm
              initialData={selectedClinic}
              onSubmit={handleUpdateClinic}
              onCancel={() => setView('list')}
              submitText="保存修改"
            />
          </div>
        ) : null;

      case 'detail':
        return selectedClinic ? (
          <div className="detail-container">
            <div className="clinic-detail-card">
              <h2>{selectedClinic.name}</h2>
              <div className="detail-info">
                <p><strong>大夫：</strong>{selectedClinic.doctorName || '未填写'}</p>
                <p><strong>地址：</strong>{selectedClinic.address || '未填写'}</p>
                <p><strong>电话：</strong>{selectedClinic.phone || '未填写'}</p>
              </div>
            </div>

            <div className="visits-section">
              <div className="visits-header">
                <h3>拜访记录</h3>
                <button
                  className="add-visit-btn"
                  onClick={() => setShowVisitForm(true)}
                >
                  + 添加拜访记录
                </button>
              </div>

              {showVisitForm && (
                <div className="modal-overlay" onClick={() => setShowVisitForm(false)}>
                  <div className="modal" onClick={e => e.stopPropagation()}>
                    <h3>添加拜访记录</h3>
                    <VisitForm
                      onSubmit={handleAddVisit}
                      onCancel={() => setShowVisitForm(false)}
                    />
                  </div>
                </div>
              )}

              <VisitList visits={visits} onDelete={handleDeleteVisit} />
            </div>
          </div>
        ) : null;

      default:
        return (
          <div className="list-container">
            <ClinicList
              clinics={clinics}
              onSelect={handleSelectClinic}
              onEdit={handleEditClinic}
              onDelete={handleDeleteClinic}
            />
          </div>
        );
    }
  };

  return (
    <div className="app">
      {renderHeader()}
      <main className="app-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;

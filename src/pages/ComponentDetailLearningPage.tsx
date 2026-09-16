import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import type { ElectronicComponent } from '../types/index';
import { ComponentDetailPage } from './ComponentDetailPage';
import { ComponentLearningPanel } from '../components/learning/ComponentLearningPanel';

export const ComponentDetailLearningPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [component, setComponent] = useState<ElectronicComponent | null>(null);

  useEffect(() => {
    let active = true;
    if (!id) return;
    api.getComponentById(id)
      .then(data => { if (active) setComponent(data); })
      .catch(() => { if (active) setComponent(null); });
    return () => { active = false; };
  }, [id]);

  return (
    <div>
      {component?.learningGuide && (
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-4">
          <ComponentLearningPanel componentName={component.name} guide={component.learningGuide} />
        </div>
      )}
      <ComponentDetailPage />
    </div>
  );
};

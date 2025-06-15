
import { useState, useEffect } from 'react';

interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  message: string;
  variables: string[];
  createdAt: string;
}

export const useWhatsAppTemplates = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);

  useEffect(() => {
    const savedTemplates = localStorage.getItem('whatsapp_templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  const saveTemplates = (newTemplates: MessageTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('whatsapp_templates', JSON.stringify(newTemplates));
  };

  const addTemplate = (template: Omit<MessageTemplate, 'id'>) => {
    const newTemplate: MessageTemplate = {
      ...template,
      id: Date.now().toString(),
    };
    saveTemplates([...templates, newTemplate]);
  };

  const updateTemplate = (updatedTemplate: MessageTemplate) => {
    const newTemplates = templates.map(template =>
      template.id === updatedTemplate.id ? updatedTemplate : template
    );
    saveTemplates(newTemplates);
  };

  const deleteTemplate = (id: string) => {
    const newTemplates = templates.filter(template => template.id !== id);
    saveTemplates(newTemplates);
  };

  const getTemplatesByCategory = (category: string) => {
    return templates.filter(template => template.category === category);
  };

  return {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplatesByCategory
  };
};

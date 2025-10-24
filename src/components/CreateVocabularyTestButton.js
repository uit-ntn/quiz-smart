import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreateVocabularyTestModal from './CreateVocabularyTestModal';

const CreateVocabularyTestButton = ({ className = '' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (!user) {
      localStorage.setItem('authReturnTo', window.location.pathname);
      navigate('/login', {
        state: {
          message: 'Vui lòng đăng nhập để tạo bài test từ vựng của riêng bạn.',
        },
      });
      return;
    }

    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center px-4 py-2 
          bg-blue-600 hover:bg-blue-700 
          text-white text-sm font-medium rounded-lg shadow-md 
          hover:shadow-lg transform hover:scale-105 
          transition-all duration-200 ${className}`}
        title="Tạo bài test từ vựng của riêng bạn"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Tự tạo bài test
      </button>

      <CreateVocabularyTestModal
        show={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default CreateVocabularyTestButton;

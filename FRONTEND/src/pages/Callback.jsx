import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-white dark:bg-neutral-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-neutral-200 dark:border-neutral-800 border-t-[#6aa200] rounded-full animate-spin"></div>
        <p className="text-neutral-500 text-sm">Redirection en cours...</p>
      </div>
    </div>
  );
};

export default Callback;

import '../styles/global.css';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusClass = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('aprovado')) return 'badge-aprovado';
    if (statusLower.includes('reprovado')) return 'badge-reprovado';
    if (statusLower.includes('arquivado')) return 'badge-arquivado';
    return 'badge-pendente';
  };

  return (
    <span className={`badge ${getStatusClass(status)}`}>
      {status}
    </span>
  );
}

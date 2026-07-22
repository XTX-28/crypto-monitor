import styles from './Skeleton.module.css';

interface TableSkeletonProps {
  rows?: number;
}

export function TableSkeleton({ rows = 6 }: TableSkeletonProps) {
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.cell} style={{ width: '30px' }}></th>
            <th className={styles.cell} style={{ width: '90px' }}></th>
            <th className={styles.cell} style={{ width: '110px' }}></th>
            <th className={styles.cell} style={{ width: '110px' }}></th>
            <th className={styles.cell} style={{ width: '80px' }}></th>
            <th className={styles.cell} style={{ width: '80px' }}></th>
            <th className={styles.cell} style={{ width: '100px' }}></th>
            <th className={styles.cell} style={{ width: '100px' }}></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className={styles.row}>
              <td className={styles.cell}><div className={styles.bar} style={{ width: '16px' }} /></td>
              <td className={styles.cell}><div className={`${styles.bar} ${styles.pulse}`} style={{ width: '60px', height: '14px' }} /></td>
              <td className={styles.cell}><div className={`${styles.bar} ${styles.pulse}`} style={{ width: '80px', height: '14px', animationDelay: `${i * 0.1}s` }} /></td>
              <td className={styles.cell}><div className={`${styles.bar} ${styles.pulse}`} style={{ width: '80px', height: '14px', animationDelay: `${i * 0.1 + 0.05}s` }} /></td>
              <td className={styles.cell}><div className={`${styles.bar} ${styles.pulse}`} style={{ width: '50px', height: '14px', animationDelay: `${i * 0.1 + 0.1}s` }} /></td>
              <td className={styles.cell}><div className={`${styles.bar} ${styles.pulse}`} style={{ width: '55px', height: '14px', animationDelay: `${i * 0.1 + 0.15}s` }} /></td>
              <td className={styles.cell}><div className={`${styles.bar} ${styles.pulse}`} style={{ width: '70px', height: '14px', animationDelay: `${i * 0.1 + 0.2}s` }} /></td>
              <td className={styles.cell}><div className={`${styles.bar} ${styles.pulse}`} style={{ width: '60px', height: '14px', animationDelay: `${i * 0.1 + 0.25}s` }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className={styles.cardGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={`${styles.bar} ${styles.pulse}`} style={{ width: '60px', height: '16px' }} />
          <div className={`${styles.bar} ${styles.pulse}`} style={{ width: '100px', height: '22px', animationDelay: `${i * 0.1}s` }} />
          <div className={`${styles.bar} ${styles.pulse}`} style={{ width: '80px', height: '12px', animationDelay: `${i * 0.1 + 0.05}s` }} />
        </div>
      ))}
    </div>
  );
}

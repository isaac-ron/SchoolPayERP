const Dashboard = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <div className="card">
          <h3>Total Students</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>0</p>
        </div>
        <div className="card">
          <h3>Total Revenue</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary-color)' }}>KES 0</p>
        </div>
        <div className="card">
          <h3>Pending Payments</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning-color)' }}>0</p>
        </div>
        <div className="card">
          <h3>Active Users</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>0</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
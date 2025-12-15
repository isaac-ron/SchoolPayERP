const Students = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Students</h1>
        <button className="btn btn-primary">Add Student</button>
      </div>
      <div className="card">
        <p>Student list will appear here</p>
      </div>
    </div>
  );
};

export default Students;
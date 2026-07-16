function Status({ status }) {
  const label = status === 'Rejected' ? 'Declined' : status;
  return <span className={`status status-${label.toLowerCase()}`}>{label}</span>;
}

export default Status;

export default function LeadTable({ leads, onStatusChange }) {
  if (!leads.length) {
    return <p className="text-zinc-400">No leads found</p>;
  }

  return (
    <div className="bg-white/10 rounded-xl overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-white/10 text-zinc-400">
          <tr>
            <th className="p-3">Name</th>
            <th>City</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {leads.map(l => (
            <tr key={l._id} className="border-b border-white/10 hover:bg-white/5">
              <td className="p-3">{l.name}</td>
              <td>{l.city}</td>
              <td>
                <select
                  value={l.status}
                  onChange={e => onStatusChange(l._id, e.target.value)}
                  className="bg-black border border-white/20 rounded px-2 py-1"
                >
                  <option>New</option>
                  <option>Interested</option>
                  <option>Converted</option>
                  <option>Rejected</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
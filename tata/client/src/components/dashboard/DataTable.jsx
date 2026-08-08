/**
 * components/dashboard/DataTable.jsx
 * Searchable data table with empty state.
 * Extracted from Dashboard.jsx; all CSS classes preserved.
 *
 * Props:
 *  headers       — string[]       column headers
 *  filteredData  — object[]       rows to display
 *  search        — string         current search term
 *  onSearch      — (value) => void
 */

const DataTable = ({ headers, filteredData, search, onSearch }) => (
  <div className="dash-card table-card">

    {/* Header row: title + search */}
    <div className="table-header">
      <h2 className="table-title">Data Table</h2>
      <div className="search-wrap">
        <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search data…"
          className="filter-input"
        />
      </div>
    </div>

    {/* Scrollable table or empty state */}
    <div className="table-scroll">
      {filteredData.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr className="table-head-row">
              {headers.map((h) => <th key={h} className="table-th">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, i) => (
              <tr key={i} className="table-body-row">
                {headers.map((h) => <td key={h} className="table-td">{row[h]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="table-empty">
          <span className="table-empty-icon">📋</span>
          <p>Upload a CSV file to see your data here.</p>
        </div>
      )}
    </div>

  </div>
);

export default DataTable;

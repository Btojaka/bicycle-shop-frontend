const Modal = ({
  title,
  columns,
  data,
  onClose,
}: {
  title: string;
  columns: string[];
  data: { [key: string]: string | number }[];
  onClose: () => void;
}) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog" // Provides screen reader support by identifying this as a modal
      aria-modal="true" // Prevents users from interacting with elements outside the modal
      aria-labelledby="modal-title" // Associates the modal with its title for better context
      aria-describedby="modal-description" // Describes the modal's content for screen readers
    >
      <div className="bg-white p-10 rounded-lg shadow-lg w-5/6 max-w-5xl min-h-[600px] flex flex-col">
        <h2 id="modal-title" className="text-3xl font-bold mb-6">
          {title}
        </h2>

        <div
          id="modal-description"
          className="overflow-x-auto overflow-y-auto max-h-[500px] flex-grow"
        >
          <table className="w-full border-collapse border border-gray-300 text-lg">
            <thead>
              <tr className="bg-gray-200">
                {columns.map((col, index) => (
                  <th key={index} className="border border-gray-300 px-8 py-4">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="text-center">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="border border-gray-300 px-8 py-4">
                      {row[col.toLowerCase()]} {/* Ensures dynamic access to properties */}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          className="mt-6 bg-red-500 text-white px-8 py-4 rounded hover:bg-red-600 text-lg self-end"
          onClick={onClose}
          aria-label="Close modal" // Helps screen reader users understand the button's purpose
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;

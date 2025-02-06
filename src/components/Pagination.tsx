const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  return (
    <div className="flex justify-center items-center gap-4 mt-4">
      <button
        className={`px-4 py-2 rounded ${
          currentPage === 1 ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        className={`px-4 py-2 rounded ${
          currentPage === totalPages ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;

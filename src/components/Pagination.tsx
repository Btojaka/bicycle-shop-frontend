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
    <nav
      className="flex justify-center items-center gap-4 mt-4"
      role="navigation" // Provides semantic meaning for assistive technologies
      aria-label="Pagination Navigation" // Describes the purpose of the component
    >
      <button
        className={`px-4 py-2 rounded ${
          currentPage === 1
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-disabled={currentPage === 1} // Communicates disabled state to assistive technologies
        aria-label="Go to previous page" // Helps screen reader users understand the action
      >
        Previous
      </button>
      <span aria-live="polite">
        Page {currentPage} of {totalPages}
      </span>
      <button
        className={`px-4 py-2 rounded ${
          currentPage === totalPages
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-disabled={currentPage === totalPages} // Communicates disabled state to assistive technologies
        aria-label="Go to next page" // Helps screen reader users understand the action
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;

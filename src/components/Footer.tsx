/**
 * Simple and accessible footer
 */
const Footer = () => {
  return (
    <footer
      className="bg-gray-900 text-white text-center p-4 mt-8"
      role="contentinfo" // Helps screen readers identify this section as site-related information
    >
      <div className="container mx-auto">
        <p
          className="text-sm"
          aria-label={`© ${new Date().getFullYear()} Bicycle Shop. All rights reserved.`} // Ensures screen readers interpret the text correctly
        >
          © {new Date().getFullYear()} Bicycle Shop. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

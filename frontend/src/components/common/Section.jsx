const Section = ({ children, className = '', ...props }) => {
  return (
    <section className={`py-12 md:py-16 ${className}`} {...props}>
      {children}
    </section>
  );
};

export default Section;

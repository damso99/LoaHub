export const Button = ({ children, variant = 'primary', className = '', as: Component = 'button', ...props }) => {
  const componentProps = Component === 'button' ? { type: props.type ?? 'button' } : {};

  return (
    <Component className={`button button-${variant} ${className}`.trim()} {...componentProps} {...props}>
      {children}
    </Component>
  );
};

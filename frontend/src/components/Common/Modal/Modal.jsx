import { Modal as AntModal } from "antd";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  footer = null,
  centered = true,
  destroyOnClose = false,
  maskClosable = true,
  ...props
}) => {
  // Size mapping to Ant Design widths
  const sizes = {
    sm: 400,
    md: 520,
    lg: 800,
    xl: 1200,
    full: "90vw",
  };

  return (
    <AntModal
      title={title}
      open={isOpen}
      onCancel={onClose}
      footer={footer}
      width={sizes[size]}
      centered={centered}
      destroyOnClose={destroyOnClose}
      maskClosable={maskClosable}
      closable={showCloseButton}
      {...props}
    >
      {children}
    </AntModal>
  );
};

export default Modal;

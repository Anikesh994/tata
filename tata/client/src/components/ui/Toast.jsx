/**
 * components/ui/Toast.jsx
 * Shared toast notification — used in Dashboard and MyExports.
 * Preserves all existing CSS classes and visual behaviour.
 */

const Toast = ({ message, type }) => (
  <div className={`toast-base ${type === "success" ? "toast-success" : "toast-error"}`}>
    <span>{type === "success" ? "✓" : "✕"}</span>
    {message}
  </div>
);

export default Toast;

import { useToast } from '@/shared/context/ToastContext';
import { useConfirm } from '@/shared/context/ConfirmContext';
import { useCallback, useRef, useMemo } from 'react';

/**
 * Hook unificado para notificaciones y confirmaciones con referencias estables
 */
export function useNotifications() {
  const toast = useToast();
  const { confirm } = useConfirm();

  const toastRef = useRef(toast);
  toastRef.current = toast;

  const confirmRef = useRef(confirm);
  confirmRef.current = confirm;

  const success = useCallback((title, message, options) => {
    toastRef.current?.success(title, message, options);
  }, []);

  const error = useCallback((title, message, options) => {
    toastRef.current?.error(title, message, options);
  }, []);

  const warning = useCallback((title, message, options) => {
    toastRef.current?.warning(title, message, options);
  }, []);

  const info = useCallback((title, message, options) => {
    toastRef.current?.info(title, message, options);
  }, []);

  const confirmDelete = useCallback(async (title, message) => {
    return await confirmRef.current?.({
      type: 'danger',
      title,
      message,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
    });
  }, []);

  const confirmAction = useCallback(async (title, message, confirmText = 'Confirmar') => {
    return await confirmRef.current?.({
      type: 'warning',
      title,
      message,
      confirmText,
      cancelText: 'Cancelar',
    });
  }, []);

  const confirmLogout = useCallback(async () => {
    return await confirmRef.current?.({
      type: 'warning',
      title: '¿Cerrar sesión?',
      message: '¿Estás seguro de que deseas salir del sistema?',
      confirmText: 'Sí, salir',
      cancelText: 'Cancelar',
    });
  }, []);

  return useMemo(() => ({
    success,
    error,
    warning,
    info,
    confirmDelete,
    confirmAction,
    confirmLogout,
  }), [success, error, warning, info, confirmDelete, confirmAction, confirmLogout]);
}

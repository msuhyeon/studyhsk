import { create } from 'zustand';

type ModalStore = {
  loginOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
};

export const useModal = create<ModalStore>((set) => ({
  loginOpen: false,
  openLoginModal: () => set({ loginOpen: true }),
  closeLoginModal: () => set({ loginOpen: false }),
}));

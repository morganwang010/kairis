import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Menu } from '../../types';

interface MenuState {
  menus: Menu[];
  collapsed: boolean;
  selectedKeys: string[];
  openKeys: string[];
}

const initialState: MenuState = {
  menus: [],
  collapsed: false,
  selectedKeys: [],
  openKeys: [],
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMenus: (state, action: PayloadAction<Menu[]>) => {
      state.menus = action.payload;
    },
    toggleCollapsed: (state) => {
      state.collapsed = !state.collapsed;
    },
    setSelectedKeys: (state, action: PayloadAction<string[]>) => {
      state.selectedKeys = action.payload;
    },
    setOpenKeys: (state, action: PayloadAction<string[]>) => {
      state.openKeys = action.payload;
    },
  },
});

export const { setMenus, toggleCollapsed, setSelectedKeys, setOpenKeys } = menuSlice.actions;
export default menuSlice.reducer;

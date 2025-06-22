import React, { useState } from 'react';
import Sidebar from './SideBar';
import { Outlet, useLocation } from 'react-router';
import styled from 'styled-components';
import { menuItems } from '../Routes';

const LayoutContainer = styled.div<{ collapsed: boolean }>`
    position: relative;
`;

const MainContent = styled.div<{ collapsed: boolean }>`
    padding: 32px;
    padding-left: 88px;
    width: 100dvw;
    height: 100dvh;
    background-color: #fffbe6;
`;
const Overlay = styled.div<{ visible: boolean }>`
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    transition: opacity 0.3s ease-in-out;
    opacity: ${(props) => (props.visible ? 0 : 0)};
    pointer-events: ${(props) => (props.visible ? 'auto' : 'none')};
`;

const PageTitle = styled.h1`
    color: #2d261f;
`;

function Layout() {
    const [collapsed, setCollapsed] = useState(true);

    const location = useLocation();

    return (
        <LayoutContainer collapsed={collapsed}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed}/>
            <Overlay visible={!collapsed}/>
            <MainContent collapsed={collapsed}>
                <PageTitle>
                    {menuItems.find((i) => i.path == location.pathname)?.label}
                </PageTitle>
                <Outlet />
            </MainContent>
        </LayoutContainer>
    );
}

export default Layout;

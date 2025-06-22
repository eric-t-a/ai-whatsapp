import React, { useState } from "react";
import styled from "styled-components";
import {
    Home,
    Settings,
    Workflow,
    MessageSquareText
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { menuItems } from "../Routes";

// --- Data ---


// --- Styles ---
const SidebarContainer = styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== 'collapsed',
  })<{ collapsed: boolean }>`
    background-color: #fdf6e3;
    color: white;
    min-height: 100vh;
    padding: 12px;
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease-in-out;
    overflow: hidden;
    position: absolute;
    z-index: 1;
    width: ${({ collapsed }) => (collapsed ? "58px" : "240px")};
    border-right: 1px solid #d6cbaa;
`;

const TopSection = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    white-space: nowrap;
`;

const LogoCircle = styled.div`
    background-color: #805ad5;
    border-radius: 9999px;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.125rem;
    flex-shrink: 0;
`;

const AppName = styled.span`
    font-size: 1.125rem;
    font-weight: 600;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #586e75;
`;

const MenuList = styled.ul`
    margin-bottom: 1.5rem;
    overflow: hidden;
    padding-left: 0;
`;

const MenuItem = styled.li`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    font-size: 14px;
    border-radius: 6px;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    color: #586e75;

    &:hover {
        background-color: #ffeac4;
    }

    &.selected {
        background-color: #ffe4b5;
        color: #3b3024;
    }

    span {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;

const Badge = styled.span.withConfig({
    shouldForwardProp: (prop) => prop !== 'newBadge',
  })<{ newBadge?: boolean }>`
    font-size: 12px;
    font-weight: 500;
    border-radius: 6px;
    padding: 0.125rem 8px;
    background-color: ${({ newBadge }) =>
        newBadge ? "#7c3aed" : "#f6a900"};
    margin-left: auto;
    max-width: fit-content;
    color: #3e2e00;
`;


interface SidebarProps {
    collapsed: boolean;
    setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {

    const navigate = useNavigate();

    const location = useLocation();

    return (
        <SidebarContainer
            collapsed={collapsed}
            onMouseEnter={() => setCollapsed(false)}
            onMouseLeave={() => setCollapsed(true)}
        >
            <TopSection>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                    <LogoCircle>W</LogoCircle>
                    {!collapsed && <AppName>WhatsApp AI</AppName>}
                </div>
                {/* {!collapsed && <Settings size={18} />} */}
            </TopSection>

            <MenuList>
                {menuItems.map(({ icon, label, badge, path }) => (
                    <MenuItem key={label} onClick={() => navigate(path)} className={location.pathname == path ? 'selected' : ''}>
                        <div style={{color:'#7a684d'}}>{icon}</div>
                        <span>{label}</span>
                        {badge && <Badge newBadge={badge === "New"}>{badge}</Badge>}
                    </MenuItem>
                ))}
            </MenuList>

        </SidebarContainer>
    );
}

import { useEffect, useRef } from "react";
import styled from "styled-components";

const commonStyles = `
    flex: 1;
    
    border: none;
    border-radius: 6px;
    background-color: #fffefc;
    outline: 1px solid #e0d4b7;
    width: 100%;
    box-sizing: border-box;
    height: 38px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    line-height: 16px;

    &:focus {
        outline: 2px solid #d3b469;
        border-color: #d3b469;
    }

    &::placeholder {
        color: #aaa;
    }
`;
const InputStyle = styled.input`
    ${commonStyles}
    padding: 8px 16px;
`;

const TextAreaStyle = styled.textarea`
    ${commonStyles}
    padding: 10px 16px;
`;

interface InputProps {
    placeholder?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => any;
    type?: string;
}

interface TextAreaProps {
    placeholder?: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => any;
    type: 'text-area'
}

const Input = ({ placeholder, value, onChange, type}: InputProps | TextAreaProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const autoResize = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "38px"; // Reset height
            textarea.style.height = `${textarea.scrollHeight}px`; // Set to full scroll height
        }
    };
    useEffect(() => {
        autoResize(); // Initial resize if there's pre-filled content
    
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.addEventListener("input", autoResize);
        }
    
        return () => {
            if (textarea) {
                textarea.removeEventListener("input", autoResize);
            }
        };
    }, []);


    if(type == 'text-area') {
        return(<TextAreaStyle ref={textareaRef} placeholder={placeholder} value={value} onChange={onChange}/>);
    }

    return(<InputStyle placeholder={placeholder} value={value} onChange={onChange}/>);
}

export default Input;
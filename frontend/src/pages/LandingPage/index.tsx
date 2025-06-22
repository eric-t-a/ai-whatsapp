import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';

function LandingPage() {
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/app')
    },[])

    return (
        <div>

        </div>
    );
}

export default LandingPage;

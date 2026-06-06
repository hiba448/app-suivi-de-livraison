import { useEffect, useState } from 'react';

const initialUserData = {
  email: '',
  name: '',
};

const UserInfo = () => {
  const [userData, setUserData] = useState(initialUserData);

  useEffect(() => {
    const email = sessionStorage.getItem('userEmail') || '';
    const name = email.substring(0, email.indexOf('@'));
    const nameCaseCorrected = name
      ? name.charAt(0).toUpperCase() + name.slice(1)
      : 'Utilisateur';

    setUserData({ email, name: nameCaseCorrected });
  }, []);

  return (
    <div className="user-info">
      <div className="user-avatar">
        {userData.name.charAt(0)}
      </div>

      <div className="user-details">
        <span className="user-label">Utilisateur connecté</span>
        <h3>{userData.name}</h3>
        <p>{userData.email}</p>
      </div>
    </div>
  );
};

export default UserInfo;
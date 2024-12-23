/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from 'react';
import { Dropdown, Avatar } from 'rsuite';
import { useHistory } from "react-router-dom";
import { User } from '../models';
import { convertToName } from '../general/Utils';

interface Props {
  user: User;
  profileLinks?: string[];
  onLogout: () => void;
};

function ProfileDropdown(props: Props) {
  const { user, profileLinks, onLogout } = props;
  const history = useHistory();

  const [userName, setUserName] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null); 
  const [loading, setLoading] = useState<boolean>(true); 

  // Displaying user's initials
  const getInitials = (name: string) => {
    const nameParts = name.split(' ');
    return nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : name[0]?.toUpperCase() || '';
  };

  const fetchOrcidProfile = async (orcidId: string) => {
    try {
      const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();
      const fullName = `${data.person.name['given-names'].value} ${data.person.name['family-name'].value}`;
      const photoUrl = data.person['photo']?.url || null; 

      setUserName(fullName);
      setPhotoUrl(photoUrl);
      sessionStorage.setItem('userName', fullName);
      sessionStorage.setItem('photoUrl', photoUrl || '');
    } catch (error) {
      console.error('Error fetching ORCID profile:', error);
      const storedName = sessionStorage.getItem('userName');
      const storedPhotoUrl = sessionStorage.getItem('photoUrl');
      setUserName(storedName || user.name || '');
      setPhotoUrl(storedPhotoUrl || null);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    const storedName = sessionStorage.getItem('userName');
    const storedPhotoUrl = sessionStorage.getItem('photoUrl');

    if (storedName && storedPhotoUrl !== null) {
      setUserName(storedName); 
      setPhotoUrl(storedPhotoUrl || null); 
      setLoading(false); 
    } else {
      if (user?.oidc_id) {
        const orcidId = user.oidc_id.split('/').pop();
        fetchOrcidProfile(orcidId!);
      } else {
        setUserName(user.name || '');
        setPhotoUrl(null);
        setLoading(false);
      }
    }
  }, [user]);

  const avatarContent = loading
    ? <div className="initials-avatar">{getInitials(userName)}</div>
    : photoUrl
    ? <img src={photoUrl} alt="Profile" className="profile-photo" />
    : <div className="initials-avatar">{getInitials(userName)}</div>;

  const customLinks = profileLinks?.map((link) => {
    const lastPathSegment = link.split('/').pop();
    return (
      <Dropdown.Item
        key={link}
        onClick={() => history.push(link)}
      >
        {convertToName(lastPathSegment!)}
      </Dropdown.Item>
    );
  });

  const dropdownItems = (
    <>
      {customLinks}
      <Dropdown.Separator />
      <Dropdown.Item
        className="logout"
        onClick={() => {
          sessionStorage.removeItem('userName'); 
          sessionStorage.removeItem('photoUrl'); 
          onLogout();
        }}
      >
        Logout
      </Dropdown.Item>
    </>
  );

  return (
    <Dropdown
      className="profile-dropdown"
      title={<Avatar size="sm" circle>{avatarContent}</Avatar>}
      placement="bottomEnd"
    >
      {userName && (
        <>
          <Dropdown.Item panel>
            <div className="profile-container">
              <div className="signed-in-label">
                <p>Signed in as</p>
              </div>
              <div className="profile-details">
                <strong className="user-name">{userName}</strong>
              </div>
            </div>
          </Dropdown.Item>
          <Dropdown.Separator />
        </>
      )}
      {dropdownItems}
    </Dropdown>
  );
};

export default ProfileDropdown;

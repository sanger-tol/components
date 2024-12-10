/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from 'react';
import { Dropdown, Avatar } from 'rsuite';
import { useHistory } from "react-router-dom";
import { User } from '../models';
import { convertToName } from 'src/general/Utils';

interface Props {
    user: User;
    profileLinks?: string[];
    onLogout: () => void;
};

function ProfileDropdown (props: Props) {
  const { user, profileLinks, onLogout } = props;
  const history = useHistory();
  const [profileData, setProfileData] = useState({ name: ''});

  const fetchOrcidProfile = async (orcidId: string) => {
    const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}`, {
      headers: { 'Accept': 'application/json' }
    });
    return response.json();
  };

  useEffect(() => {
    if (user?.oidc_id) {
      const orcidId = user.oidc_id.split('/').pop();
      fetchOrcidProfile(orcidId!).then(data => {
        const fullName = `${data.person.name['given-names'].value} ${data.person.name['family-name'].value}`;
        setProfileData({
          name: fullName
        });
      });
    }
  }, [user]);

  // Generates items from custom links
  const customLinks = profileLinks?.map((link) => {
    const lastPathSegment = link.split('/').pop();
  return (
    <Dropdown.Item 
      key={link}
      onClick={() => history.push(link)}
    >
      {convertToName(lastPathSegment!)}
    </Dropdown.Item>
  )
})

  // Dropdown items
  const dropdownItems = (
    <>
      {customLinks}
      <Dropdown.Separator />
      <Dropdown.Item 
      className = "logout" 
      onClick={onLogout}
      >Logout</Dropdown.Item>
    </>
  );

  return (
    <Dropdown
      className="profile-dropdown"
      title={<Avatar size="sm" circle>
      {profileData.name ? `${profileData.name.split(' ')[0][0]}${profileData.name.split(' ')[1][0]}` : ''}
      </Avatar>}
      placement="bottomEnd"
    >
      {(profileData.name) && (
        <>
          <Dropdown.Item panel>
            <div className="profile-container">
              <div className="signed-in-label">
                <p>signed in as</p>
              </div>
              <div className="profile-details">
                <strong className="user-name">{profileData.name}</strong>
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

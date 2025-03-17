/*
SPDX-FileCopyrightText: 2024 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { useEffect, useState } from "react";
import { Avatar } from "rsuite";
import { Page, User } from "../models";
import { convertToPath } from "../general/utils";
import { Nav, NavDropdown } from "react-bootstrap";

interface Props {
  user: User;
  pages?: Page[];
  onLogout: () => void;
}

function ProfileDropdown(props: Props) {
  const { user, pages, onLogout } = props;

  const [userName, setUserName] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Displaying user's initials
  const getInitials = (name: string) => {
    const nameParts = name.split(" ");
    return nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : name.substring(0, 2)?.toUpperCase() || "";
  };

  const fetchOrcidProfile = async (orcidId: string) => {
    try {
      const response = await fetch(`https://pub.orcid.org/v3.0/${orcidId}`, {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      const fullName = `${data.person.name["given-names"].value} ${data.person.name["family-name"].value}`;
      const photoUrl = data.person["photo"]?.url || null;

      setUserName(fullName);
      setPhotoUrl(photoUrl);
      sessionStorage.setItem("userName", fullName);
      sessionStorage.setItem("photoUrl", photoUrl || "");
    } catch (error) {
      console.error("Error fetching ORCID profile:", error);
      const storedName = sessionStorage.getItem("userName");
      const storedPhotoUrl = sessionStorage.getItem("photoUrl");
      setUserName(storedName || user.name || "");
      setPhotoUrl(storedPhotoUrl || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedName = sessionStorage.getItem("userName");
    const storedPhotoUrl = sessionStorage.getItem("photoUrl");

    if (storedName && storedPhotoUrl !== null) {
      setUserName(storedName);
      setPhotoUrl(storedPhotoUrl || null);
      setLoading(false);
    } else {
      if (user?.oidc_id) {
        if (user.oidc_id.includes("/") || (user.oidc_id.includes("-") && user.oidc_id.length === 19)) {
          const orcidId = user.oidc_id.split("/").pop();
          fetchOrcidProfile(orcidId!);
        } else {
          setUserName(user.oidc_id.split("@").shift() || "");
        }
      } else {
        setUserName(user.name || "");
        setPhotoUrl(null);
        setLoading(false);
      }
    }
  }, [user]);

  const avatarContent = loading ? (
    <div className="initials-avatar">{getInitials(userName)}</div>
  ) : photoUrl ? (
    <img src={photoUrl} alt="Profile" className="profile-photo" />
  ) : (
    <div className="initials-avatar">{getInitials(userName)}</div>
  );

  const dropdownPages = pages?.map((page) => {
    const link = convertToPath(page.name);
    return (
      <Nav.Link key={page.name} href={link}>
        {page.name}
      </Nav.Link>
    );
  });

  const dropdownContents = (
    <div className="nav-dropdown-box">
      {dropdownPages}
      <Nav.Link
        className="logout"
        key="logout"
        onClick={() => {
          sessionStorage.removeItem("userName");
          sessionStorage.removeItem("photoUrl");
          onLogout();
        }}
      >
        Logout
      </Nav.Link>
    </div>
  );

  return (
    <NavDropdown
      className="profile-dropdown"
      title={
        <Avatar size="sm" circle>
          {avatarContent}
        </Avatar>
      }
      placement="bottom-end"
    >
      {userName && (
        <div className="profile-container">
          <p>Signed in as</p>
          <div className="profile-details">
            <p className="user-name">{userName}</p>
          </div>
        </div>
      )}
      {dropdownContents}
    </NavDropdown>
  );
}

export default ProfileDropdown;

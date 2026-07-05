import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { Button } from 'react-bootstrap';
import { userListRoleIdWiseApi } from '../../services/User-service';

export default function ApprovalFormItems({
  approver = {}, // Default to empty object
  index,
  availableRoles = [], // Default to empty array
  handleRoleChange = () => {}, // Default to no-op
  handleInputChange = () => {}, // Default to no-op
  addRow = () => {}, // Default to no-op
  removeRow = () => {}, // Default to no-op
  loading = false,
}) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedForward, setSelectedForward] = useState({});
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const forward = [
    { label: 'No', value: 'no' },
    { label: 'Yes', value: 'yes' }
  ];
  const [forwardOption, setForwardOption] = useState(forward); // Assuming you want to manage loading state


  // Fetch users based on the selected role
  const userListFun = (role_id) => {
    setIsLoadingUsers(true);
    userListRoleIdWiseApi(role_id)
      .then((response) => {
        if (response && response.data) {
          const usersRec = response.data.map((obj) => ({
            label: obj?.name,
            value: obj?.id,
            isDisabled: false,
          }));
          setUsers(usersRec);
        } else {
          setUsers([]); // Reset if no data
        }
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
        setUsers([]);
      })
      .finally(() => {
        setIsLoadingUsers(false);
      });
  };

  // Trigger user fetch when role changes
  useEffect(() => {
    if (approver.tac_role_id) {
      userListFun(approver.tac_role_id);
    } else {
      setUsers([]); // Reset if role ID is cleared
    }
  }, [approver.tac_role_id]);

  // Automatically select user if tac_user_id exists in fetched users
  useEffect(() => {

  
    if (approver.tac_user_id && users.length > 0) {
      const matchedUser = users.find(
        (user) => String(user.value) === String(approver.tac_user_id)
      );
  
      if (matchedUser) {
        setSelectedUser(matchedUser);
      } else {
        console.warn('No matching user found for tac_user_id:', approver.tac_user_id);
        setSelectedUser(null);
      }
    }
  }, [approver.tac_user_id, users]);

  useEffect(() => {
    if (approver.taca_forward_option) {
      const matchedData = forward.find(
        (fordata) => String(fordata.value) === String(approver.taca_forward_option)
      );

  
      if (matchedData) {
        setSelectedForward(matchedData);
      } else {
        setSelectedForward(null);
      }
    }
  }, [approver.taca_forward_option]);
  
  

  // Defensive checks
  const selectedRole = availableRoles.find((role) => role.value === approver.tac_role_id);

  return (
    <tr>
      <td>
        <Select
          options={availableRoles}
          styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          value={selectedRole}
          onChange={(role) => handleRoleChange(index, role ? role.value : '')}
          isDisabled={loading} // Disable when form is in loading state
          required
        />
      </td>
      {/* <td>
        <Select
          options={users}
          isLoading={isLoadingUsers} // Show loading spinner
          value={selectedUser}
          onChange={(user) => {
            setSelectedUser(user || null); // Update selectedUser state
            handleInputChange(index, 'tac_user_id', user ? user.value : '');
          }}
          isDisabled={loading || isLoadingUsers} // Disable when fetching users
          required
        />
      </td> */}
      <td>
        <Select
          options={forwardOption}
          isLoading={isLoadingUsers} // Show loading spinner
          value={selectedForward}
          onChange={(forData) => {
            setSelectedForward(forData || null); // Update selectedUser state
            handleInputChange(index, 'taca_forward_option', forData ? forData.value : '');
          }}
          isDisabled={loading || isLoadingUsers} // Disable when fetching users
          required
        />
      </td>
      <td>{approver.taca_approver_index}</td>
      <td>
        {index === 0 ? (
          <Button variant="primary" onClick={addRow} disabled={loading}>
            Add Row
          </Button>
        ) : (
          <Button variant="danger" onClick={() => removeRow(index)} disabled={loading}>
            Remove
          </Button>
        )}
      </td>
    </tr>
  );
}

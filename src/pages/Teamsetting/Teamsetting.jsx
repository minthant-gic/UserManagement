import React, { useState, useEffect } from "react";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Select,
  Table,
  message,
} from "antd";
import styles from "../../styles/Teamsetting.module.css";
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { getTeams, getUsers, updateUser } from "../../api/api";
import { Messages } from "../../data/message";
import { Helmet } from "react-helmet";

const Teamsetting = ({ loginUser, form }) => {
  // State variables definition
  // State variable to hold the user data fetched from the API.
const [userData, setUserData] = useState([]);

// State variable to hold the team data fetched from the API.
const [teamData, setTeamData] = useState([]);

// State variable to hold the team data filtered based on the search input in the team name search modal.
const [searchteamData, setsearchteamData] = useState([]);

// State variable to indicate if data is currently being loaded from the API.
const [loading, setLoading] = useState(true);

// State variable to store the users selected for moving to another team from the "clickUsers" box.
const [selectedUsers, setSelectedUsers] = useState([]);

// State variable to store the users selected for the current team in the "clickUsers" box.
const [clickUsers, setClickUsers] = useState([]);

// State variable to control the visibility of the team name search modal.
const [isModalVisible, setIsModalVisible] = useState(false);

// State variable to hold the user data filtered based on the selected team names in the team name search modal.
const [user, setUser] = useState([]);

// State variable to store the user's input for team name search in the team name search modal.
const [teamSearchInput, setTeamSearchInput] = useState("");

// State variable to store the selected team names in the team name search modal.
const [searchValues, setSearchValues] = useState([]);

// Constant to represent the number of users displayed per page in the team name search modal.
const pageSize = 6;

// State variable to store the current page number for pagination in the team name search modal.
const [currentPage, setCurrentPage] = useState(1);

// State variable to store the selected team name from the team select box for moving users to a different team.
const [selectedTeamFromSelectBox, setSelectedTeamFromSelectBox] = useState("");


    // useEffect hook to fetch users and teams data when the component mounts
  useEffect(() => {
    fetchUsers();
    return () => {
       // Clean up the state when the component unmounts
      setUserData([]);
      setTeamData([]);
      setSelectedUsers([]);
      setClickUsers([]);
      setSearchValues([]);
    };
  }, []);

  // Function to fetch users and teams data from the API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await getUsers();
      const teams = await getTeams();
      const filteredData = users.filter((user) => user.del_flg === "0");
      const filteredTeam = teams.filter((team) => team.del_flg === "0");
      setTeamData(filteredTeam);
      setUserData(filteredData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  // Function to handle click event on a user, either selecting or deselecting
  const handleClickUser = (userId) => {
    const clickedUser = userData.find((user) => user._id === userId);

    if (clickedUser) {
      const userAlreadySelected = selectedUsers.some(
        (selectedUser) => selectedUser._id === userId
      );
      if (!userAlreadySelected) {
        setSelectedUsers((prevSelectedUsers) => [
          ...prevSelectedUsers,
          clickedUser,
        ]);
      } else {
        setSelectedUsers((prevSelectedUsers) =>
          prevSelectedUsers.filter((user) => user._id !== userId)
        );
      }
    }
  };

  // Function to handle search input for teams and filter the results
  const onSearch = (value) => {
    setTeamSearchInput(value);
    const lowerCaseSearch = value.toLowerCase();
    const filteredTeams = teamData.filter((team) =>
      team.team_name.toLowerCase().includes(lowerCaseSearch)
    );
    if (value === "なし") {
      setsearchteamData([noneTeam, ...filteredTeams]);
    } else {
      setsearchteamData(filteredTeams);
    }
  };

  // Function to handle form submission to update users' team information
  const handleFormSubmit = async (values) => {
    const newUserData = clickUsers.map((user) => ({
      ...user,
      del_flg: "0",
      update_user: loginUser[0]._id,
      update_datetime: new Date().toISOString(),
      team_name: selectedTeamFromSelectBox,
    }));

    try {
      for (const user of newUserData) {
        await updateUser(user._id, user);
      }
    } catch (error) {
      console.error("Error updating users:", error);
    }
    message.success(Messages.M008);

    const updatedClickUsers = clickUsers.map((user) => ({
      ...user,
      team_name: selectedTeamFromSelectBox,
    }));
  
    
    setClickUsers(updatedClickUsers);
    setSelectedUsers([]);
    setSelectedTeamFromSelectBox("");
    
  };

  // Function to handle search form submission and filter user data based on selected teams
  const handleSearchSubmit = async (values) => {
    const selectedTeam = values.teamSelect === "なし" ? "" : values.teamSelect;
    const newSearchValue = values.teamSearchInput;

    setSearchValues((prevSearchValues) => [
      ...prevSearchValues,
      newSearchValue,
    ]);

    let filteredUserData;
    if (searchValues.includes("なし")) {
      filteredUserData = userData.filter(
        (user) => !user.team_name || searchValues.includes(user.team_name)
      );
    } else {
      filteredUserData = userData.filter(
        (user) => searchValues.includes(user.team_name) && user.team_name
      );
    }

    setUser(filteredUserData);
    setClickUsers([]);
    setIsModalVisible(false);
    if (filteredUserData.length === 0) {
      message.warning(Messages.M022);
      return;
    }
  };

  // Function to handle the click event on the "Right" arrow button in the teamsetting box.
  const handleRightClick = () => {
    if (!loading) {
      setClickUsers((prevUsers) => {
        const uniqueSelectedUsers = selectedUsers.filter(
          (selectedUser) => !prevUsers.includes(selectedUser)
        );
        return [...prevUsers, ...uniqueSelectedUsers];
      });
      setSelectedUsers([]);
    }
  };

  // Function to handle the click event on the "Left" arrow button in the teamsetting box.
  const handleLeftClick = () => {
    if (!loading) {
      setClickUsers((prevClickUsers) => {
        const updatedClickUsers = prevClickUsers.filter(
          (user) =>
            !selectedUsers.some((selectedUser) => selectedUser._id === user._id)
        );
        return updatedClickUsers;
      });
      setSelectedUsers([]);
    }
  };

  // Function to handle checkbox change in the search modal
  const onChange = (e, record) => {
    if (e.target.checked) {
      setSearchValues((prevSearchValues) => [
        ...prevSearchValues,
        record.team_name,
      ]);
    } else {
      setSearchValues((prevSearchValues) =>
        prevSearchValues.filter((value) => value !== record.team_name)
      );
    }
  };

  // Function to handle the click event on the "Search" icon, displaying the team name search modal.
  const handleShowModal = () => {
    setIsModalVisible(true);
  };

  // Table columns definition for rendering team search results
  const columns = [
    {
      title: () => <div style={{ textAlign: 'center' }}>番号</div>,
      dataIndex: "id",
      key: "id",
      render: (_, record, index) => (
        <Checkbox onChange={(e) => onChange(e, record, index)}>
          {index + 1 + (currentPage - 1) * pageSize}
        </Checkbox>
      ),
    },
    {
      title: () => <div style={{ textAlign: 'center' }}>チーム名</div>,
      dataIndex: "team_name",
      key: "team_name",
    },
  ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const noneTeam = {
    id: "none",
    team_name: "なし",
  };

  let combinedTeamData;
  if (teamSearchInput.length === 0) {
    combinedTeamData = [noneTeam, ...teamData];
  } else {
    combinedTeamData = searchteamData;
  }

  const teamOptions = teamData.map((team) => ({
    value: team.team_name,
    label: team.team_name,
  }));

  return (
    <>
      <Helmet>
        <title>User Management</title>
        <link rel="icon" type="image/png" href="/path/to/favicon.png" />
      </Helmet>
      <div className={styles["teamsetting-main"]}>
        <div className={styles["teamsetting-container"]}>
          <div className={styles["teamsetting-search"]}>
            <label className={styles["teamsetting-label"]}>チーム名 : </label>
            <SearchOutlined
              style={{
                background: "blue",
                color: "#fff",
                padding: "5px",
                fontSize: "20px",
                cursor: "pointer",
                borderRadius: "5px",
                marginLeft: "20px",
              }}
              onClick={handleShowModal}
            />
          </div>
          <Modal
            title="チーム名検索"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            centered
            form={form}
          >
            <Form>
              <Form.Item label="チーム名">
                <Input
                  style={{ width: "100%" }}
                  placeholder="検索条件入力"
                  name="teamSearchInput"
                  value={teamSearchInput}
                  onChange={(e) => onSearch(e.target.value)}
                />
              </Form.Item>
              <Table
                dataSource={combinedTeamData}
                columns={columns}
                rowKey="id"
                pagination={{
                  pageSize,
                  onChange: handlePageChange,
                }}
              />
              <Form.Item style={{ textAlign: "center" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={handleSearchSubmit}
                >
                  追加
                </Button>
              </Form.Item>
            </Form>
          </Modal>
          <div className={styles["div-color"]}>
            <Form form={form} onFinish={handleFormSubmit}>
              <Form.Item
                name="teamSelect"
                className={styles["usermanagement-form-item"]}
              >
                <div>
                  <div className={styles["selectbox-label"]}>
                    <label>チームに移動</label>
                  </div>
                  <Select
                    style={{ width: "250px" }}
                    className={styles["usermanagement-input"]}
                    options={teamOptions}
                    value={
                      selectedTeamFromSelectBox
                    } 
                    onChange={(value) => {
                      form.setFieldsValue({ teamSelect: value });
                      setSelectedTeamFromSelectBox(
                        value
                      );
                    }}
                  />
                </div>
              </Form.Item>
              <Form.Item>
                <div className={styles["teamsetting-box-main"]}>
                  <p htmlFor="teamSelect" className={styles["user-name"]}>
                    ユーザー名 :{" "}
                  </p>
                  <div className={styles["teamsetting-box-container"]}>
                    <div className={styles["teamsetting-box"]}>
                      {loading ? (
                        <div>Loading...</div>
                      ) : (
                        <>
                          {user?.map((user) => (
                            <div
                              onClick={() => handleClickUser(user._id)}
                              className={`${styles["teamsetting-user"]} ${
                                clickUsers.find(
                                  (clickedUser) => clickedUser._id === user._id
                                )
                                  ? styles["none"]
                                  : ""
                              } ${
                                selectedUsers.find(
                                  (selectedUser) =>
                                    selectedUser._id === user._id
                                )
                                  ? styles["selected"]
                                  : ""
                              }`}
                              key={user?._id}
                            >
                              <div>{`${user.user_name} ${user.user_name_last}`}</div>
                              <div>{user.email}</div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                  <div className={styles["teamsetting-btn-main"]}>
                    <div
                      className={styles["teamsetting-btn-container"]}
                      onClick={handleRightClick}
                    >
                      <DoubleRightOutlined
                        className={styles["teamsetting-btn"]}
                      />
                    </div>
                    <div
                      className={styles["teamsetting-btn-container"]}
                      onClick={handleLeftClick}
                    >
                      <DoubleLeftOutlined
                        className={styles["teamsetting-btn"]}
                      />
                    </div>
                  </div>
                  <div className={styles["teamsetting-box-container"]}>
                    <div className={styles["teamsetting-box"]}>
                      {clickUsers?.map((user) => (
                        <div
                          className={`${styles["teamsetting-user"]} ${
                            selectedUsers.some(
                              (selectedUser) => selectedUser._id === user._id
                            )
                              ? styles["selected"]
                              : ""
                          }`}
                          onClick={() => handleClickUser(user._id)}
                          key={user?._id}
                        >
                          <div>{`${user.user_name} ${user.user_name_last}`}</div>
                          <div>{user.email}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Form.Item>
              <Form.Item className={styles["submit-button"]}>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={
                    !selectedTeamFromSelectBox || clickUsers.length === 0
                  } 
                >
                  決定
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Teamsetting;

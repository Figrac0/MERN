import UsersList from "../components/UsersList";

const Users = () => {
    const USERS = [
        {
            id: "u1",
            image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
            name: "Max",
            places: 3,
        },
    ];

    return <UsersList items={USERS} />;
};

export default Users;

const { where } = require('sequelize');
const Users = require('./users.model');
const usersModel = require('./users.model');
const usersQuery = require('./users.query');

exports.getUsers = async (req, res) => {
    try {
        const { personal_information_id } = req.query;
        const whereCondition = {};

        if (personal_information_id)
            whereCondition.personal_information_id = personal_information_id;

        const query = usersQuery(
            whereCondition,
            []
        );

        const users = await usersModel.findAll(query);

        return res.status(200).json({
            message: users.length === 0 ? 'Aún no hay usuarios registrados en el sistema.' : null,
            data: users
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}

exports.updateUser = async (req, res) => {
    const { personal_information_id } = req.params;
    const { username, hashed_password, role } = req.body;

    try {
        if (!hashed_password)
            return res.status(400).json({ message: 'Complete los campos obligatorios.' });

        const uUser = await Users.findOne({ where: { personal_information_id } });

        if (!uUser) return res.status(404).json({ message: 'Usuario no encontrado.' });

        const existUsername = await Users.findOne({ where: { username } });

        if (existUsername && existUsername.personal_information_id != personal_information_id)
            return res.status(409).json({ message: 'El nombre de usuario ya se encuentra registrado.' });

        const firstRegister = uUser.username === null && uUser.hashed_password === null;

        uUser.username = username;
        uUser.hashed_password = hashed_password;
        uUser.role = role;

        await uUser.save();
        return res.status(201).json({
            message: firstRegister
                ? 'Usuario registrado correctamente.'
                : 'Usuario actualizado correctamente.'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
}
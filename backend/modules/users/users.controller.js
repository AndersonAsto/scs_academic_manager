const { where } = require('sequelize');
const Users = require('./users.model');
const usersModel = require('./users.model');
const usersQuery = require('./users.query');
const PersonalInformation = require('./personal_information.model');
const fs = require('fs');
const path = require('path');
const sequelize = require('../../config/db.config');

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
    const { username, hashed_password, role, profile_picture, description } = req.body;

    try {

        const uUser = await Users.findOne({ where: { personal_information_id } });

        if (!uUser) return res.status(404).json({ message: 'Usuario no encontrado.' });

        const existUsername = await Users.findOne({ where: { username } });

        if (existUsername && existUsername.personal_information_id != personal_information_id)
            return res.status(409).json({ message: 'El nombre de usuario ya se encuentra registrado.' });

        const firstRegister = uUser.username === null && uUser.hashed_password === null;

        uUser.username = username;
        uUser.hashed_password = hashed_password;
        uUser.role = role;
        uUser.profile_picture = profile_picture;
        uUser.description = description;

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

exports.getMyProfile = async (req, res) => {
    try {
        const { personalInformationId } = req.user;

        const user = await Users.findOne({
            where: { personal_information_id: personalInformationId, status: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const personalInformation = await PersonalInformation.findOne({
            where: { id: personalInformationId },
        });

        return res.status(200).json({
            data: {
                id: user.id,
                username: user.username,
                role: user.role,
                profile_picture: user.profile_picture,
                personalInformation,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

exports.updateMyProfile = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { personalInformationId } = req.user;
        const { username, password, email, phone_number } = req.body;

        const user = await Users.findOne({
            where: { personal_information_id: personalInformationId, status: true },
            transaction,
        });

        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const personalInformation = await PersonalInformation.findOne({
            where: { id: personalInformationId },
            transaction,
        });

        // Validar unicidad de username, email y teléfono ANTES de escribir nada.
        if (username && username !== user.username) {
            const existUsername = await Users.findOne({ where: { username }, transaction });
            if (existUsername && existUsername.id !== user.id) {
                await transaction.rollback();
                return res.status(409).json({ message: 'El nombre de usuario ya se encuentra registrado.' });
            }
        }

        if (email && email !== personalInformation.email) {
            const existEmail = await PersonalInformation.findOne({ where: { email }, transaction });
            if (existEmail && existEmail.id !== personalInformation.id) {
                await transaction.rollback();
                return res.status(409).json({ message: 'El correo ya se encuentra registrado.' });
            }
        }

        if (phone_number && phone_number !== personalInformation.phone_number) {
            const existPhone = await PersonalInformation.findOne({ where: { phone_number }, transaction });
            if (existPhone && existPhone.id !== personalInformation.id) {
                await transaction.rollback();
                return res.status(409).json({ message: 'El teléfono ya se encuentra registrado.' });
            }
        }

        if (username) user.username = username;
        if (password) user.hashed_password = password; // el hook beforeUpdate lo hashea

        await user.save({ transaction });

        if (email) personalInformation.email = email;
        if (phone_number) personalInformation.phone_number = phone_number;

        await personalInformation.save({ transaction });

        await transaction.commit();

        return res.status(200).json({ message: 'Perfil actualizado correctamente.' });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

exports.updateMyProfilePicture = async (req, res) => {
    try {
        const { personalInformationId } = req.user;

        if (!req.file) {
            return res.status(400).json({ message: 'Debe adjuntar una imagen.' });
        }

        const user = await Users.findOne({
            where: { personal_information_id: personalInformationId, status: true },
        });

        if (!user) {
            fs.unlink(req.file.path, () => {});
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Elimina la foto anterior para no acumular archivos huérfanos.
        if (user.profile_picture) {
            const previousPath = path.join(__dirname, '../../public', user.profile_picture);
            fs.unlink(previousPath, () => {}); // si no existe, se ignora
        }

        const relativePath = `/images/profiles/${req.file.filename}`;
        user.profile_picture = relativePath;
        await user.save();

        return res.status(200).json({ message: 'Foto de perfil actualizada.', profile_picture: relativePath });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};

exports.deleteMyProfilePicture = async (req, res) => {
    try {
        const { personalInformationId } = req.user;

        const user = await Users.findOne({
            where: { personal_information_id: personalInformationId, status: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        if (!user.profile_picture) {
            return res.status(200).json({ message: 'No tienes una foto de perfil configurada.' });
        }

        const filePath = path.join(__dirname, '../../public', user.profile_picture);
        fs.unlink(filePath, (err) => {
            // Si el archivo ya no existe en disco, no es un error real — igual limpiamos la BD.
            if (err && err.code !== 'ENOENT') {
                console.error('Error al eliminar el archivo de perfil:', err.message);
            }
        });

        user.profile_picture = null;
        await user.save();

        return res.status(200).json({ message: 'Foto de perfil eliminada.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor. Inténtelo más tarde.' });
    }
};
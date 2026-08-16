async function buildUserPayload(user, query) {
    const personalInformation = await query.getPersonalInformation(user.personal_information_id);

    let roleProfile = null;

    switch (user.role) {
        case 'Administrador':
        case 'Docente':
            roleProfile = await query.getAcademicStaffByPersonalInfo(user.personal_information_id);
            break;
        case 'Apoderado':
            roleProfile = await query.getParentByPersonalInfo(user.personal_information_id);
            break;
        case 'Estudiante':
            roleProfile = await query.getStudentByPersonalInfo(user.personal_information_id);
            break;
    }

    return {
        id: user.id,
        username: user.username,
        role: user.role,
        profile_picture: user.profile_picture,
        personalInformation,
        roleProfile,
    };
}

module.exports = { buildUserPayload };
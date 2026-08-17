require('dotenv').config({ quiet: true });
const helmet = require('helmet');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

const cookieParser = require('cookie-parser');
const sequelize = require('./config/db.config');
const app = express();
const PORT = process.env.PORT || 3000;
const appRoutes = require('./index/index.routes');

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (
            origin.startsWith("http://localhost") ||
            origin.startsWith("http://127.0.0.1") ||
            origin === "https://schoolnet.site"
        ) {
            return callback(null, true);
        }

        return callback(new Error('No autorizado por CORS.'));
    },
    exposedHeaders: ['Content-Disposition'],
    credentials: true,
};

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.use('/api', appRoutes.AuthRoutes);

app.use('/api', appRoutes.CoursesRoutes);
app.use('/api', appRoutes.GradesRoutes);
app.use('/api', appRoutes.SectionsRoutes);
app.use('/api', appRoutes.TimeSlotsRoutes);
app.use('/api', appRoutes.YearsRoutes);
app.use('/api', appRoutes.TeachingBlocksRoutes);
app.use('/api', appRoutes.SchoolDaysRoutes);
app.use('/api', appRoutes.AcademicStaffRoutes);
app.use('/api', appRoutes.AcademicStaffContractsRoutes);
app.use('/api', appRoutes.UsersRoutes);
app.use('/api', appRoutes.RegistrationsRoutes);
app.use('/api', appRoutes.ParentsRoutes);
app.use('/api', appRoutes.PersonalInformationRoutes);
app.use('/api', appRoutes.StduentsRoutes);
app.use('/api', appRoutes.WeightingsRoutes);
app.use('/api', appRoutes.TeacherGroupsRoutes);
app.use('/api', appRoutes.SchedulesRoutes);
app.use('/api', appRoutes.SchoolDaysBySchedule);
app.use('/api', appRoutes.AcademicRecordsRoutes);
app.use('/api', appRoutes.TeachingBlockCourseAverageRoutes);
app.use('/api', appRoutes.CourseAverageRoutes);
app.use('/api', appRoutes.GeneralAverageRoutes);
app.use('/api', appRoutes.AnnouncementsRoutes);
app.use('/api', appRoutes.DashboardRoutes);

app.get('/', (req, res) => {
    res.send('Bienvenido');
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Conexión a la base de datos exitosa.');
        console.log('Base de datos sincronizada.');

        if (process.env.NODE_ENV !== 'test') {
            app.listen(PORT, () => {
                console.log(`Servidor corriendo en http://localhost:${PORT}`);
            });
        }
    })
    .catch(err => {
        console.error('Error al conectar con la base de datos: ', err.message);
    });

module.exports = app;

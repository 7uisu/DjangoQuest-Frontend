import re

file_path = '/Users/hansu/Documents/Capstone/DjangoQuest-Frontend/src/pages/TeacherDashboard.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Imports
content = content.replace('''import {
  Add as AddIcon,
  School as SchoolIcon,
  ContentCopy as CopyIcon,
  ArrowBack as BackIcon,
  LockReset as ResetIcon,
  Group as GroupIcon,
  Class as ClassIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonRemove as KickIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import {
  getClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  getClassroomDetail,
  resetStudentPassword,
  removeStudent,
  ClassroomData,
  ClassroomDetailData,
} from '../api/dashboard';''', '''import { useNavigate } from 'react-router-dom';
import {
  Add as AddIcon,
  School as SchoolIcon,
  ContentCopy as CopyIcon,
  Group as GroupIcon,
  Class as ClassIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import {
  getClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  ClassroomData,
} from '../api/dashboard';''')

# 2. State
content = content.replace('''  // State
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<ClassroomDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create classroom
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit classroom
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editing, setEditing] = useState(false);

  // Delete classroom
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Password reset
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ id: number; username: string } | null>(null);
  const [resetting, setResetting] = useState(false);

  // Remove Student
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ id: number; username: string } | null>(null);
  const [removing, setRemoving] = useState(false);

  // Detailed Grades and Search
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsTarget, setDetailsTarget] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');''', '''  const navigate = useNavigate();

  // State
  const [classrooms, setClassrooms] = useState<ClassroomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create classroom
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit classroom
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [editClassName, setEditClassName] = useState('');
  const [editing, setEditing] = useState(false);

  // Delete classroom
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);''')

# 3. Actions
content = content.replace('''  const handleViewClassroom = async (id: number) => {
    setError('');
    try {
      const data = await getClassroomDetail(id);
      setSelectedClassroom(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load classroom details.');
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    setResetting(true);
    setError('');
    try {
      const result = await resetStudentPassword(resetTarget.id);
      setResetDialogOpen(false);
      setSuccess(`Password for ${resetTarget.username} reset to: ${result.new_password}`);
      setResetTarget(null);
      setTimeout(() => setSuccess(''), 8000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password.');
    } finally {
      setResetting(false);
    }
  };''', '''  const handleViewClassroom = (id: number) => {
    navigate(`/teacher-dashboard/class/${id}`);
  };''')

content = content.replace('''  const handleRemoveStudent = async () => {
    if (!removeTarget || !selectedClassroom) return;
    setRemoving(true);
    setError('');
    try {
      const result = await removeStudent(selectedClassroom.id, removeTarget.id);
      setRemoveDialogOpen(false);
      setSuccess(result.detail);
      setRemoveTarget(null);
      // Refresh classroom details
      await handleViewClassroom(selectedClassroom.id);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to remove student.');
    } finally {
      setRemoving(false);
    }
  };

  const copyToClipboard''', '''  const copyToClipboard''')

# 4. Header UI
content = content.replace('''        <Fade in timeout={800}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              {selectedClassroom && (
                <Button startIcon={<BackIcon />} onClick={() => setSelectedClassroom(null)} sx={{ color: alpha(theme.palette.common.white, 0.7), mb: 1 }}>
                  Back to Classrooms
                </Button>
              )}
              <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                <SchoolIcon sx={{ mr: 1, fontSize: 40, verticalAlign: 'middle' }} />
                {selectedClassroom ? selectedClassroom.name : 'Teacher Dashboard'}
              </Typography>
              <Typography variant="h6" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                {selectedClassroom
                  ? `Enrollment Code: ${selectedClassroom.enrollment_code}`
                  : `Welcome, ${user?.first_name || user?.username}! Manage your classrooms below.`}
              </Typography>
            </Box>
            {!selectedClassroom && (
              <Button''', '''        <Fade in timeout={800}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                <SchoolIcon sx={{ mr: 1, fontSize: 40, verticalAlign: 'middle' }} />
                Teacher Dashboard
              </Typography>
              <Typography variant="h6" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                Welcome, {user?.first_name || user?.username}! Manage your classrooms below.
              </Typography>
            </Box>
            <Button''')


# 5. List View Conditions
content = content.replace('''        {/* Classroom List View */}
        {!selectedClassroom && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>''', '''        {/* Classroom List View */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>''')

content = content.replace('''              ))
            )}
          </Box>
        )}

        {/* Classroom Detail View */}''', '''              ))
            )}
          </Box>

        {/* Classroom Detail View */}''')

# 6. Detailed View code block
import re
# Remove selectedClassroom chunk
detail_view_pattern = r'\{\/\* Classroom Detail View \*\/\}[\s\S]*?\{\/\* Create Classroom Dialog \*\/\}'
content = re.sub(detail_view_pattern, '{/* Create Classroom Dialog */}', content, count=1)

# Remove Reset Student Password Dialog
reset_dialog_pattern = r'\{\/\* Password Reset Dialog \*\/\}[\s\S]*?\{\/\* Edit Classroom Dialog \*\/\}'
content = re.sub(reset_dialog_pattern, '{/* Edit Classroom Dialog */}', content, count=1)

# Remove Student Dialog & View Detailed Grades Dialog
remove_dialog_pattern = r'\{\/\* Remove Student Dialog \*\/\}[\s\S]*?<\/Box>\n  \);\n\};\n\nexport default TeacherDashboard;'
content = re.sub(remove_dialog_pattern, '</Box>\n  );\n};\n\nexport default TeacherDashboard;', content, count=1)

with open(file_path, 'w') as f:
    f.write(content)

print("Updated TeacherDashboard.tsx successfully")

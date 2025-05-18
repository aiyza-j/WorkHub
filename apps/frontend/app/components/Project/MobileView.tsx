import React from 'react';
import {
  Card,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Project } from '../../types/Project';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { containerVariants, itemVariants } from '../Project/styles';

interface MobileViewProps {
  projects: Project[];
  editingProjectId: string | null;
  selectedProject: Project | null;
  router: any;
  handleEdit: (project: Project) => void;
  handleSave: () => void;
  handleCancelEdit: () => void;
  handleOpenDeleteModal: (project: Project) => void;
  setSelectedProject: (project: Project) => void;
}

const MobileView: React.FC<MobileViewProps> = ({
  projects,
  editingProjectId,
  selectedProject,
  router,
  handleEdit,
  handleSave,
  handleCancelEdit,
  handleOpenDeleteModal,
  setSelectedProject,
}) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {projects.length === 0 ? (
        <Card
          component={motion.div}
          variants={itemVariants}
          sx={{ p: 3, textAlign: 'center', mb: 2 }}
        >
          <Typography variant="body1">No projects yet.</Typography>
        </Card>
      ) : (
        projects.map((project) => (
          <Card
            key={project._id}
            component={motion.div}
            variants={itemVariants}
            sx={{
              p: 2,
              mb: 2,
              position: 'relative',
              cursor: editingProjectId === project._id ? 'default' : 'pointer',
              '&:hover': {
                boxShadow: 4,
                transform: editingProjectId === project._id ? 'none' : 'translateY(-2px)',
                transition: 'all 0.3s ease-in-out',
              }
            }}
            onClick={() => {
              if (!editingProjectId) {
                router.push(`/task?projectId=${project._id}`);
              }
            }}
          >
            <Box sx={{ mb: 1 }}>
              {editingProjectId === project._id ? (
                <TextField
                  fullWidth
                  label="Name"
                  value={selectedProject?.name || ''}
                  onChange={(e) => setSelectedProject({ ...selectedProject!, name: e.target.value })}
                  size="small"
                  sx={{ mb: 2 }}
                />
              ) : (
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  {project.name}
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 2 }}>
              {editingProjectId === project._id ? (
                <TextField
                  fullWidth
                  label="Description"
                  value={selectedProject?.description || ''}
                  onChange={(e) => setSelectedProject({ ...selectedProject!, description: e.target.value })}
                  size="small"
                  multiline
                  rows={2}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {project.description}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Owner: {project.owner_email}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {editingProjectId === project._id ? (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave();
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelEdit();
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(project);
                      }}
                      sx={{
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.1)' }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDeleteModal(project);
                      }}
                      sx={{
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.1)' }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>
          </Card>
        ))
      )}
    </motion.div>
  );
};

export default MobileView;
import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Project } from '../../types/Project';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { containerVariants, itemVariants } from '../Project/styles';

interface TableViewProps {
  projects: Project[];
  editingProjectId: string | null;
  selectedProject: Project | null;
  router: ReturnType<typeof useRouter>;
  handleEdit: (project: Project) => void;
  handleSave: () => void;
  handleCancelEdit: () => void;
  handleOpenDeleteModal: (project: Project) => void;
  setSelectedProject: (project: Project) => void;
}

const TableView: React.FC<TableViewProps> = ({
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
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      elevation={3}
      sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "rgba(60, 9, 108, 0.05)" }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Owner</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody component={motion.tbody} variants={containerVariants} initial="hidden" animate="visible">
            {projects.length === 0 ? (
              <TableRow component={motion.tr} variants={itemVariants}>
                <TableCell colSpan={4} align="center">
                  <Typography py={2}>No projects yet.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow
                  key={project._id}
                  component={motion.tr}
                  variants={itemVariants}
                  hover
                  onClick={() => {
                    if (!editingProjectId) {
                      router.push(`/task?projectId=${project._id}`);
                    }
                  }}
                  sx={{
                    cursor: editingProjectId === project._id ? 'default' : 'pointer',
                    transition: 'background-color 0.3s',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <TableCell>
                    {editingProjectId === project._id ? (
                      <TextField
                        value={selectedProject?.name || ''}
                        onChange={(e) =>
                          setSelectedProject({ ...selectedProject!, name: e.target.value })
                        }
                        size="small"
                        fullWidth
                      />
                    ) : (
                      <Typography fontWeight="medium">{project.name}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingProjectId === project._id ? (
                      <TextField
                        value={selectedProject?.description || ''}
                        onChange={(e) =>
                          setSelectedProject({ ...selectedProject!, description: e.target.value })
                        }
                        size="small"
                        fullWidth
                      />
                    ) : (
                      project.description
                    )}
                  </TableCell>
                  <TableCell>{project.owner_email}</TableCell>
                  <TableCell>
                    {editingProjectId === project._id ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="contained"
                          onClick={(e) => { e.stopPropagation(); handleSave(); }}
                          size="small"
                          startIcon={<SaveIcon />}
                          sx={{
                            borderRadius: 1.5,
                            px: 5,
                            textTransform: 'none',
                            transition: 'all 0.2s',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                }

                          }}
                        >
                          Save
                        </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outlined"
                          onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}
                          size="small"
                          startIcon={<CancelIcon />}
                          sx={{
                            borderRadius: 1.5,
                                textTransform: 'none',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                }
                          }}
                        >
                          Cancel
                        </Button>
                        </motion.div>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <IconButton
                          color="primary"
                          onClick={(e) => { e.stopPropagation(); handleEdit(project); }}
                          size="small"
                          sx={{
                                transition: 'all 0.2s',
                                '&:hover': { transform: 'scale(1.1)' }
                              }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <IconButton
                          color="error"
                          onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(project); }}
                          size="small"
                          sx={{
                            transition: 'all 0.2s',
                            '&:hover': { transform: 'scale(1.1)' }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                    </motion.div>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TableView;
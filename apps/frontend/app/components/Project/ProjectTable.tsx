'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  TextField,
  Button,
  MenuItem,
  Select,
  Pagination,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Card,
  IconButton,
  Fade,
  Backdrop,
  alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Wrap components with motion
const MotionTableRow = motion(TableRow);
const MotionCard = motion(Card);
const MotionPaper = motion(Paper);

interface Project {
  _id: string;
  name: string;
  description: string;
  owner_email: string;
}

interface ServerResponse {
  projects: Project[];
  totalCount: number;
}

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  bgcolor: 'background.paper',
  p: 4,
  borderRadius: 2,
  boxShadow: 24,
  outline: 'none',
};

const ITEMS_PER_PAGE = 5;

export default function ProjectTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [uniqueOwners, setUniqueOwners] = useState<string[]>([]);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');

    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', ITEMS_PER_PAGE.toString());
    if (searchTerm) params.append('search', searchTerm);

    try {
      const res = await fetch(`http://localhost:5000/api/projects/?${params.toString()}`, {
        headers: { Authorization: token || '' },
      });
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data: ServerResponse = await res.json();

      setProjects(data.projects);
      setTotalCount(data.totalCount);
    } catch (err: any) {
      setError(err.message);
      setProjects([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Refetch projects on filters or page change
  useEffect(() => {
    fetchProjects();
  }, [searchTerm, emailFilter, page]);

  // Reset to page 1 if filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, emailFilter]);

  const handleOpenCreateModal = () => {
    setSelectedProject({ _id: '', name: '', description: '', owner_email: '' });
    setOpenCreateModal(true);
  };

  const handleOpenDeleteModal = (project: Project) => {
    setSelectedProject(project);
    setOpenDeleteModal(true);
  };

  const handleCloseModals = () => {
    setSelectedProject(null);
    setOpenCreateModal(false);
    setOpenDeleteModal(false);
    setEditingProjectId(null);
  };

  const handleCreate = async () => {
    if (!selectedProject?.name || !selectedProject?.description) return;
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:5000/api/projects/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify({
          name: selectedProject.name,
          description: selectedProject.description,
        }),
      });
      fetchProjects();
      handleCloseModals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!selectedProject) return;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/projects/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify({
          project_id: selectedProject._id,
          name: selectedProject.name,
          description: selectedProject.description,
        }),
      });

  
      fetchProjects();
      handleCloseModals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedProject?._id) return;
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:5000/api/projects/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || '',
        },
        body: JSON.stringify({ project_id: selectedProject._id }),
      });
      fetchProjects();
      handleCloseModals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProjectId(project._id);
    setSelectedProject({ ...project });
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setSelectedProject(null);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  };

  // Mobile Card View for projects
  const renderMobileView = () => {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {projects.length === 0 ? (
          <MotionCard
            variants={itemVariants}
            sx={{ p: 3, textAlign: 'center', mb: 2 }}
          >
            <Typography variant="body1">No projects yet.</Typography>
          </MotionCard>
        ) : (
          projects.map((project) => (
            <MotionCard
              key={project._id.toString()}
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
                    onChange={(e) => setSelectedProject((prev) => ({ ...prev!, name: e.target.value }))}
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
                    onChange={(e) => setSelectedProject((prev) => ({ ...prev!, description: e.target.value }))}
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
            </MotionCard>
          ))
        )}
      </motion.div>
    );
  };

  // Table View for desktop
  const renderTableView = () => {
    return (
      <MotionPaper

        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        elevation={3}
        sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Owner</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody component={motion.tbody} variants={containerVariants} initial="hidden" animate="visible">
              {projects.length === 0 ? (
                <MotionTableRow variants={itemVariants}>
                  <TableCell colSpan={4} align="center">
                    <Typography py={2}>No projects yet.</Typography>
                  </TableCell>
                </MotionTableRow>
              ) : (
                projects.map((project) => (
                  <MotionTableRow
                    key={project._id.toString()}
                    hover
                    variants={itemVariants}
                    onClick={() => {
                      if (!editingProjectId) {
                        router.push(`/task?projectId=${project._id}`);
                      }
                    }}
                    sx={{
                      cursor: editingProjectId === project._id ? 'default' : 'pointer',
                      transition: 'background-color 0.3s',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      }
                    }}
                  >
                    <TableCell>
                      {editingProjectId === project._id ? (
                        <TextField
                          value={selectedProject?.name || ''}
                          onChange={(e) =>
                            setSelectedProject((prev) => ({ ...prev!, name: e.target.value }))
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
                            setSelectedProject((prev) => ({
                              ...prev!,
                              description: e.target.value,
                            }))
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
                          <Button
                            variant="contained"
                            onClick={(e) => {e.stopPropagation(); handleSave()}}
                            size="small"
                            sx={{
                              px: 2,
                              transition: 'transform 0.2s',
                              '&:hover': { transform: 'scale(1.05)' }
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={(e) => {e.stopPropagation(); handleCancelEdit()}}
                            size="small"
                            sx={{
                              transition: 'transform 0.2s',
                              '&:hover': { transform: 'scale(1.05)' }
                            }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            color="primary"
                            onClick={(e) => {e.stopPropagation(); handleEdit(project)}}
                            size="small"
                            sx={{
                              transition: 'all 0.2s',
                              '&:hover': { transform: 'scale(1.1)' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={(e) => {e.stopPropagation(); handleOpenDeleteModal(project)}}
                            size="small"
                            sx={{
                              transition: 'all 0.2s',
                              '&:hover': { transform: 'scale(1.1)' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </TableCell>
                  </MotionTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </MotionPaper>
    );
  };

  return (
    <Box sx={{
      padding: { xs: 2, sm: 3, md: 4 },
      marginTop: { xs: 6, md: 8 },
      maxWidth: '1200px',
      mx: 'auto'
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 600,
            mb: 4,
            fontSize: { xs: '1.75rem', md: '2.25rem' }
          }}
        >
          Projects
        </Typography>
      </motion.div>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 4,
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <TextField
          sx={{
            width: { xs: '100%', sm: '70%', md: '80%' },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              },
              '&.Mui-focused': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }
            }
          }}
          placeholder="Search projects..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          onClick={handleOpenCreateModal}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: 2,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
            }
          }}
        >
          Create Project
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.error.main, 0.1),
            borderLeft: `4px solid ${theme.palette.error.main}`,
            mb: 2
          }}
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <>
          {isMobile ? renderMobileView() : renderTableView()}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 3
            }}
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Pagination
              count={Math.ceil(totalCount / ITEMS_PER_PAGE)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }
              }}
            />
          </Box>
        </>
      )}

      {/* Create Modal */}
      <Modal
        open={openCreateModal}
        onClose={handleCloseModals}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={openCreateModal}>
          <Box sx={modalStyle} component={motion.div} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <Typography variant="h6" mb={3} fontWeight="600">
              Create New Project
            </Typography>
            <TextField
              fullWidth
              label="Project Name"
              value={selectedProject?.name || ''}
              onChange={(e) =>
                setSelectedProject((prev) => ({ ...prev!, name: e.target.value }))
              }
              sx={{ mb: 3 }}
              InputProps={{
                sx: {
                  borderRadius: 1.5,
                }
              }}
            />
            <TextField
              fullWidth
              label="Description"
              value={selectedProject?.description || ''}
              onChange={(e) =>
                setSelectedProject((prev) => ({ ...prev!, description: e.target.value }))
              }
              sx={{ mb: 3 }}
              multiline
              rows={3}
              InputProps={{
                sx: {
                  borderRadius: 1.5,
                }
              }}
            />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleCloseModals}
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
              <Button
                variant="contained"
                onClick={handleCreate}
                sx={{
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  }
                }}
              >
                Create
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={openDeleteModal}
        onClose={handleCloseModals}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={openDeleteModal}>
          <Box sx={modalStyle} component={motion.div} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <Typography variant="h6" mb={2} fontWeight="600">
              Confirm Delete
            </Typography>
            <Typography mb={3}>
              Are you sure you want to delete project <strong>{selectedProject?.name}</strong>?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleCloseModals}
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
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
                sx={{
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  }
                }}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
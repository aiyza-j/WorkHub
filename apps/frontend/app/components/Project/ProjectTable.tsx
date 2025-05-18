'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  Button,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Pagination,
  alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Project, ServerResponse } from '../../models/Project';
import { fetchProjects, createProject, updateProject, deleteProject } from '../../services/projectServices';
import CreateModal from '../CreateModal';
import DeleteModal from './DeleteModal';
import MobileView from './MobileView';
import TableView from './TableView';

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
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const loadProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchProjects(page, ITEMS_PER_PAGE, searchTerm);
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

  useEffect(() => {
    loadProjects();
  }, [searchTerm, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

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

    try {
      await createProject(selectedProject.name, selectedProject.description);
      loadProjects();
      handleCloseModals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!selectedProject) return;

    try {
      await updateProject(selectedProject._id, selectedProject.name, selectedProject.description);
      loadProjects();
      handleCloseModals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!selectedProject?._id) return;

    try {
      await deleteProject(selectedProject._id);
      loadProjects();
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
          {isMobile ? (
            <MobileView
              projects={projects}
              editingProjectId={editingProjectId}
              selectedProject={selectedProject}
              router={router}
              handleEdit={handleEdit}
              handleSave={handleSave}
              handleCancelEdit={handleCancelEdit}
              handleOpenDeleteModal={handleOpenDeleteModal}
              setSelectedProject={setSelectedProject}
            />
          ) : (
            <TableView
              projects={projects}
              editingProjectId={editingProjectId}
              selectedProject={selectedProject}
              router={router}
              theme={theme}
              handleEdit={handleEdit}
              handleSave={handleSave}
              handleCancelEdit={handleCancelEdit}
              handleOpenDeleteModal={handleOpenDeleteModal}
              setSelectedProject={setSelectedProject}
            />
          )}

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

      <CreateModal
        open={openCreateModal}
        handleClose={handleCloseModals}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        handleCreate={handleCreate}
      />

      <DeleteModal
        open={openDeleteModal}
        handleClose={handleCloseModals}
        selectedProject={selectedProject}
        handleDelete={handleDelete}
      />
    </Box>
  );
}
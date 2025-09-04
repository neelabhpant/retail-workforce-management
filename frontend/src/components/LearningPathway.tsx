import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  TrendingUp, 
  Award, 
  Clock, 
  Target,
  User,
  Search,
  Plus,
  Play,
  CheckCircle,
  ArrowRight,
  Star,
  Calendar,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { api, LearningPath, Employee } from '../services/api';

interface LearningModule {
  id: string;
  name: string;
  duration_weeks: number;
  difficulty: string;
  skills: string[];
  completed?: boolean;
  progress?: number;
}

interface CareerGoals {
  target_role: string;
  target_timeframe: string;
  focus_areas: string[];
}

const LearningPathway: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [learningPaths, setLearningPaths] = useState<Record<string, LearningPath>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [careerGoals, setCareerGoals] = useState<CareerGoals>({
    target_role: '',
    target_timeframe: '12_months',
    focus_areas: []
  });

  const skillCategories = [
    'Customer Service',
    'Sales Techniques', 
    'Leadership',
    'Team Management',
    'Product Knowledge',
    'Communication',
    'Problem Solving',
    'Technical Skills',
    'Analytics',
    'Training & Development'
  ];

  const targetRoles = [
    'Senior Sales Associate',
    'Team Lead',
    'Department Supervisor',
    'Assistant Manager',
    'Store Manager',
    'Regional Manager',
    'Training Specialist',
    'Customer Experience Manager'
  ];

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await api.getEmployees();
      setEmployees(response.employees);
      if (response.employees.length > 0 && !selectedEmployee) {
        setSelectedEmployee(response.employees[0]);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const createLearningPath = async (employeeId: string, goals: CareerGoals) => {
    setIsCreating(true);
    
    try {
      const response = await api.createLearningPath({
        employee_id: employeeId,
        career_goals: {
          target_role: goals.target_role,
          target_timeframe: goals.target_timeframe,
          focus_areas: goals.focus_areas
        }
      });
      
      if (response.success) {
        setLearningPaths(prev => ({
          ...prev,
          [employeeId]: response.data
        }));
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Failed to create learning path:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentLearningPath = selectedEmployee ? learningPaths[selectedEmployee.employee_id] : null;

  // Mock skill assessment data for radar chart
  const skillAssessmentData = currentLearningPath ? [
    { skill: 'Customer Service', current: 3.5, target: 4.5 },
    { skill: 'Sales', current: 3.0, target: 4.0 },
    { skill: 'Leadership', current: 2.5, target: 4.5 },
    { skill: 'Communication', current: 4.0, target: 4.5 },
    { skill: 'Problem Solving', current: 3.5, target: 4.0 },
    { skill: 'Technical', current: 2.0, target: 3.5 }
  ] : [];

  // Mock progress over time data
  const progressData = currentLearningPath ? Array.from({length: 12}, (_, i) => ({
    month: `Month ${i + 1}`,
    progress: Math.min(100, (i + 1) * (100 / currentLearningPath.total_duration_weeks * 4))
  })) : [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning & Development Pathways</h1>
          <p className="text-gray-600 mt-1">AI-powered personalized career development and skill building</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-cdp-blue text-white rounded-md hover:bg-cdp-dark transition-colors font-medium"
        >
          <Plus className="h-5 w-5" />
          <span>Create Learning Path</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Employee Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Select Employee</h2>
          
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cdp-blue focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredEmployees.map((employee) => (
              <button
                key={employee.employee_id}
                onClick={() => setSelectedEmployee(employee)}
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  selectedEmployee?.employee_id === employee.employee_id
                    ? 'bg-cdp-blue text-white'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                }`}
              >
                <div className="font-medium">{employee.name}</div>
                <div className={`text-sm ${
                  selectedEmployee?.employee_id === employee.employee_id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {employee.role} • {employee.department}
                </div>
                {learningPaths[employee.employee_id] && (
                  <div className={`text-xs mt-1 ${
                    selectedEmployee?.employee_id === employee.employee_id ? 'text-blue-200' : 'text-green-600'
                  }`}>
                    ✓ Learning path active
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {selectedEmployee && (
            <>
              {/* Employee Profile */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-cdp-blue rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedEmployee.name}</h2>
                      <p className="text-gray-600">{selectedEmployee.role} • {selectedEmployee.department}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">
                          Performance: {selectedEmployee.performance_score}/5
                        </span>
                        <span className="text-sm text-gray-500">
                          Satisfaction: {selectedEmployee.satisfaction_score}/5
                        </span>
                        <span className="text-sm text-gray-500">
                          Skill Level: {selectedEmployee.skill_level}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {!currentLearningPath && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Path</span>
                    </button>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.floor((Date.now() - new Date(selectedEmployee.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 30))}
                    </div>
                    <div className="text-sm text-blue-800">Months Tenure</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">${selectedEmployee.hourly_wage}/hr</div>
                    <div className="text-sm text-green-800">Current Rate</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedEmployee.availability_hours}h</div>
                    <div className="text-sm text-purple-800">Weekly Availability</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {currentLearningPath ? Math.round(currentLearningPath.current_progress * 100) : 0}%
                    </div>
                    <div className="text-sm text-orange-800">Learning Progress</div>
                  </div>
                </div>
              </div>

              {/* Learning Path Content */}
              {currentLearningPath ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Path Overview */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold">Career Development Path</h2>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-600">
                          Target: <span className="font-medium">{currentLearningPath.target_role}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Duration: <span className="font-medium">{currentLearningPath.total_duration_weeks} weeks</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                        <span className="text-sm text-gray-600">
                          {Math.round(currentLearningPath.current_progress * 100)}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                          className="bg-gradient-to-r from-cdp-blue to-cdp-green h-3 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${currentLearningPath.current_progress * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        ></motion.div>
                      </div>
                    </div>

                    {/* Learning Modules */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentLearningPath.modules.map((module, index) => {
                        const isCompleted = index < currentLearningPath.modules.length * currentLearningPath.current_progress;
                        const isActive = index === Math.floor(currentLearningPath.modules.length * currentLearningPath.current_progress);
                        
                        return (
                          <motion.div
                            key={module.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              isCompleted ? 'border-green-200 bg-green-50' :
                              isActive ? 'border-blue-200 bg-blue-50' :
                              'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-gray-900">{module.name}</h3>
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : isActive ? (
                                <Play className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Clock className="h-5 w-5 text-gray-400" />
                              )}
                            </div>

                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">{module.duration_weeks} weeks</span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                                {module.difficulty}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {module.skills.map((skill, skillIndex) => (
                                <span
                                  key={skillIndex}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skills Assessment and Progress Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Skill Radar Chart */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h2 className="text-xl font-semibold mb-4">Skills Assessment</h2>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={skillAssessmentData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="skill" />
                            <PolarRadiusAxis domain={[0, 5]} tickCount={6} />
                            <Radar
                              name="Current Level"
                              dataKey="current"
                              stroke="#8884d8"
                              fill="#8884d8"
                              fillOpacity={0.3}
                            />
                            <Radar
                              name="Target Level"
                              dataKey="target"
                              stroke="#82ca9d"
                              fill="#82ca9d"
                              fillOpacity={0.1}
                            />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="flex items-center justify-center space-x-6 mt-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 opacity-60 rounded"></div>
                          <span className="text-sm">Current Level</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 opacity-60 rounded"></div>
                          <span className="text-sm">Target Level</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Over Time */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h2 className="text-xl font-semibold mb-4">Learning Progress Timeline</h2>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={progressData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
                            <Line
                              type="monotone"
                              dataKey="progress"
                              stroke="#3B82F6"
                              strokeWidth={3}
                              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Milestones and Actions */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upcoming Milestones */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h2 className="text-xl font-semibold mb-4">Upcoming Milestones</h2>
                      <div className="space-y-4">
                        {currentLearningPath.milestones.slice(0, 4).map((milestone, index) => (
                          <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-cdp-blue rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">{milestone.week}</span>
                              </div>
                            </div>
                            <div className="flex-grow">
                              <div className="font-medium text-gray-900">{milestone.milestone}</div>
                              <div className="text-sm text-gray-600">Week {milestone.week}</div>
                            </div>
                            <div>
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Actions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h2 className="text-xl font-semibold mb-4">Recommended Actions</h2>
                      <div className="space-y-4">
                        {currentLearningPath.recommended_actions.map((action, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                            <Star className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-grow">
                              <span className="text-blue-900">{action}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Skill Gaps */}
                      <div className="mt-6">
                        <h3 className="font-medium text-gray-900 mb-3">Identified Skill Gaps</h3>
                        <div className="flex flex-wrap gap-2">
                          {currentLearningPath.skill_gaps.map((gap, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                            >
                              {gap}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <BookOpen className="h-16 w-16 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-900">No Learning Path Created</h3>
                    <p className="text-gray-600 max-w-md">
                      Create a personalized learning and development path for {selectedEmployee.name} to unlock their potential and advance their career.
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center space-x-2 px-6 py-3 bg-cdp-blue text-white rounded-md hover:bg-cdp-dark transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Create Learning Path</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Learning Path Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Learning Path</h2>
                
                {selectedEmployee && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900">Employee: {selectedEmployee.name}</h3>
                    <p className="text-gray-600">{selectedEmployee.role} • {selectedEmployee.department}</p>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Role
                    </label>
                    <select
                      value={careerGoals.target_role}
                      onChange={(e) => setCareerGoals(prev => ({ ...prev, target_role: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cdp-blue focus:border-transparent"
                    >
                      <option value="">Select target role...</option>
                      {targetRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Timeframe
                    </label>
                    <select
                      value={careerGoals.target_timeframe}
                      onChange={(e) => setCareerGoals(prev => ({ ...prev, target_timeframe: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cdp-blue focus:border-transparent"
                    >
                      <option value="6_months">6 Months</option>
                      <option value="12_months">12 Months</option>
                      <option value="18_months">18 Months</option>
                      <option value="24_months">24 Months</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Focus Areas
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {skillCategories.map(skill => (
                        <label key={skill} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={careerGoals.focus_areas.includes(skill)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCareerGoals(prev => ({
                                  ...prev,
                                  focus_areas: [...prev.focus_areas, skill]
                                }));
                              } else {
                                setCareerGoals(prev => ({
                                  ...prev,
                                  focus_areas: prev.focus_areas.filter(area => area !== skill)
                                }));
                              }
                            }}
                            className="text-cdp-blue focus:ring-cdp-blue"
                          />
                          <span className="text-sm">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => selectedEmployee && createLearningPath(selectedEmployee.employee_id, careerGoals)}
                    disabled={!careerGoals.target_role || isCreating}
                    className="px-6 py-2 bg-cdp-blue text-white rounded-md hover:bg-cdp-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Award className="h-4 w-4" />
                        <span>Create Path</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningPathway;
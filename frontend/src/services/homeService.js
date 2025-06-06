import { getAllCourses } from "./courseService"; // Assuming courseService is in the same parent directory

export const getOpenCoursesForHome = async () => {
  try {
    const data = await getAllCourses();
    const now = new Date();

    const openCourses = data.filter((course) => {
      const startDate = new Date(course.START_DATE);
      return startDate > now;
    });

    return openCourses.map((course) => ({
      id: course.COURSE_ID,
      name: course.NAME,
      description: course.DESCRIPTION, 
    }));
  } catch (error) {
    console.error("Failed to fetch open courses for home:", error);
    return [];
  }
};
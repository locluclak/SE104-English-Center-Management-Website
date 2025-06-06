export const comparePathname = (pathname1: string, pathname2: string) => {
    const path1 = pathname1.replace(/(^\/)|(\/$)/g, '');
    const path2 = pathname2.replace(/(^\/)|(\/$)/g, '');
    return path1 === path2;
}
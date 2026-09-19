from pathlib import Path

from setuptools import setup, find_packages


reqs = [
    line.strip()
    for line in Path("requirements.txt").read_text().splitlines()
    if line.strip() and not line.startswith("#")
]


setup(
    name="smartmeasure",
    version="0.1.0",
    description="Measure real-world object dimensions from photos using ArUco reference markers",
    packages=find_packages(exclude=["tests", "tests.*"]),
    python_requires=">=3.10",
    install_requires=reqs,
)
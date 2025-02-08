from setuptools import setup, find_packages

setup(
    name="jobspy",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "pandas",
        "requests",
        "beautifulsoup4",
        "selenium",
        "python-dotenv",
        'pydantic',
        'tls_client',
        'numpy',
        'markdownify',
        'regex',
        'pymongo',
        'google-generativeai'
    ],
) 
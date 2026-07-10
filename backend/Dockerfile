# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Create a non-root user that Hugging Face Spaces expects
RUN useradd -m -u 1000 user

# Set the working directory inside the container
WORKDIR /code

# Copy the requirements file and install dependencies
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the backend source code
COPY ./app /code/app

# Set ownership of the /code directory to the non-root user so SQLite can write to it
RUN chown -R user:user /code

# Switch to the non-root user
USER user

# Set environment variable to make python look in the right place
ENV PYTHONPATH=/code

# Hugging Face Spaces runs on port 7860 by default
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]

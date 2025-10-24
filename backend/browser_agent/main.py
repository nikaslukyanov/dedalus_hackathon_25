# input: .json file that details all the actions that need to be taken

import asyncio
import json
from browser_use import Agent, ChatBrowserUse
from langchain_openai import ChatOpenAI
from dedalus_labs import AsyncDedalus, DedalusRunner
from dotenv import load_dotenv

load_dotenv()

async def dedalus_llm_call(prompt: str, model: str = "openai/gpt-4o") -> str:
    """
    Helper function to make LLM calls using Dedalus Labs SDK.

    Args:
    prompt: The prompt to send to the LLM
    model: Model to use (default: openai/gpt-4o)
    
    Returns:
        The LLM's response as a string
    """
    client = AsyncDedalus()
    runner = DedalusRunner(client)  
    result = await runner.run(
        input=prompt,
        model=model,
        tools=[]
    )   

async def execute_task_from_json(task_data, website_url: str):
    """
    Execute a browser task based on JSON task definition.

    Args:
        task_json: JSON string with task_id, task_name, and steps
        website_url: The URL of the website to interact with
    """ 
    # Build steps text - broken down for clarity
    steps_list = []
    for step in task_data['steps']:
        step_id = step['step_id']
        step_name = step['step_name']
        step_text = f"{step_id}. {step_name}"
        steps_list.append(step_text)    
    steps_text = "\n".join(steps_list)  
    prompt = f"""Given this task: {task_data['task_name']}  
            And these steps:
            {steps_text}

            Create a clear, concise browser automation instruction that can be executed on {website_url}. 
            Format it as a single paragraph describing what actions to take.""" 
    # Get refined task description from Dedalus
    task_description = await dedalus_llm_call(prompt)   
    # if none, just use this
    task_description = f"""Navigate to {website_url} and complete this task: {task_data['task_name']}
                        Execute these steps in order:{steps_text}
                        Be careful to wait for page loads and handle any pop-ups or cookie notices."""  
    llm = ChatBrowserUse()
    task = task_description
    agent = Agent(task=task, llm=llm, browser_config={
        "headless": False,
        "slow_mo": 50,
        "args": ["--start-maximized"],
    })
    result = await agent.run()  
    return result

# Example usage
if __name__ == "__main__":
    with open('/Users/alissawu/dedalus_hackathon_25/backend/browser_agent/sample.json', 'r') as f:
        task_data = json.load(f)

    website_url = "https://wuandnussbaumnyc.com/"   
    # Run the task
    result = asyncio.run(execute_task_from_json(task_data, website_url))    
    print(f"Task completed: {result}")